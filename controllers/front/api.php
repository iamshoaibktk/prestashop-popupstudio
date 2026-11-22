<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

use Iamshoaibktk\Popupstudio\Coupons;
use Iamshoaibktk\Popupstudio\Front;
use Iamshoaibktk\Popupstudio\Gdpr;
use Iamshoaibktk\Popupstudio\Newsletter;
use Iamshoaibktk\Popupstudio\Repository;
use Iamshoaibktk\Popupstudio\Stats;
use Iamshoaibktk\Popupstudio\Webhook;

/**
 * Storefront endpoint: events, signups, games, survey answers, coupon apply and cart refresh.
 */
class PopupstudioApiModuleFrontController extends ModuleFrontController
{
    public $ajax = true;
    public $ssl = true;

    public function initContent()
    {
        // No page output.
    }

    public function displayAjax()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        if (!Tools::isSubmit('token') || !hash_equals((string) Tools::getToken(false), (string) Tools::getValue('token'))) {
            $this->reply(['ok' => false, 'error' => 'token'], 403);
        }
        $action = (string) Tools::getValue('do');
        switch ($action) {
            case 'event':
                $this->event();
                break;
            case 'subscribe':
                $this->subscribe();
                break;
            case 'play':
                $this->play();
                break;
            case 'answer':
                $this->answer();
                break;
            case 'feedback':
                $this->feedback();
                break;
            case 'apply':
                $this->apply();
                break;
            case 'cart':
                $this->reply(['ok' => true, 'cart' => Front::cart($this->context)]);
                break;
        }
        $this->reply(['ok' => false, 'error' => 'action'], 400);
    }

    private function reply(array $data, $code = 200)
    {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * @return array|null live popup (or today's preview)
     */
    private function popup()
    {
        $id = (int) Tools::getValue('id');
        $p = $id ? (new Repository())->getPopup($id) : null;
        if (!$p) {
            return null;
        }
        $previewOk = hash_equals(Front::previewKey($id, (string) Configuration::get('POPUPSTUDIO_SECRET')), (string) Tools::getValue('key'));
        if ($p['status'] !== 'live' && !$previewOk) {
            return null;
        }
        if (!in_array((int) $this->context->shop->id, $p['shops'], true) && !$previewOk) {
            return null;
        }

        return $p;
    }

    private function variantId(array $p)
    {
        $v = (int) Tools::getValue('v');
        foreach ($p['variants'] as $row) {
            if ((int) $row['id_variant'] === $v) {
                return $v;
            }
        }

        return $p['variants'] ? (int) $p['variants'][0]['id_variant'] : 0;
    }

    private function event()
    {
        $p = $this->popup();
        if (!$p) {
            $this->reply(['ok' => false]);
        }
        $e = (string) Tools::getValue('e');
        $d = (string) Tools::getValue('d');
        Stats::event((int) $p['id'], $this->variantId($p), $e, $d);
        $this->reply(['ok' => true]);
    }

    private function answer()
    {
        $p = $this->popup();
        if (!$p) {
            $this->reply(['ok' => false]);
        }
        Stats::answer((int) $p['id'], $this->variantId($p), (string) Tools::getValue('q'), (string) Tools::getValue('a'));
        $this->reply(['ok' => true]);
    }

    /**
     * Free-text answer from a textarea block (for example "What went wrong?").
     */
    private function feedback()
    {
        $p = $this->popup();
        if (!$p) {
            $this->reply(['ok' => false]);
        }
        $msg = trim(strip_tags((string) Tools::getValue('msg')));
        if ($msg === '') {
            $this->reply(['ok' => false, 'error' => 'empty']);
        }
        if ($this->tooMany('feedback', (int) $p['id'], 20)) {
            $this->reply(['ok' => false, 'error' => 'rate']);
        }
        $email = isset($this->context->cookie->psx_email) ? (string) $this->context->cookie->psx_email : '';
        if ($email === '' && $this->context->customer && $this->context->customer->isLogged()) {
            $email = (string) $this->context->customer->email;
        }
        Db::getInstance()->insert('popupstudio_feedback', [
            'id_shop' => (int) $this->context->shop->id,
            'id_popup' => (int) $p['id'],
            'id_variant' => $this->variantId($p),
            'question' => pSQL(Tools::substr(preg_replace('/[^A-Za-z0-9_-]/', '', (string) Tools::getValue('q')), 0, 64)),
            'rating' => max(0, min(10, (int) Tools::getValue('rating'))),
            'message' => pSQL(Tools::substr($msg, 0, 2000)),
            'email' => pSQL(Validate::isEmail($email) ? $email : ''),
            'id_lang' => (int) $this->context->language->id,
            'page' => pSQL(Tools::substr((string) Tools::getValue('page'), 0, 255)),
            'ip' => pSQL(Tools::getRemoteAddr()),
            'date_add' => date('Y-m-d H:i:s'),
        ]);
        $this->reply(['ok' => true]);
    }

    private function tooMany($table, $idPopup, $limit)
    {
        $ip = pSQL(Tools::getRemoteAddr());

        return (int) Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'popupstudio_' . $table . '`
            WHERE id_popup = ' . (int) $idPopup . ' AND ip = "' . $ip . '" AND date_add > DATE_SUB(NOW(), INTERVAL 1 DAY)') >= $limit;
    }

    /**
     * Weighted draw on the server, respecting per-prize stock.
     */
    private function draw(array $p)
    {
        $game = isset($p['settings']['game']) ? $p['settings']['game'] : [];
        $prizes = isset($game['prizes']) ? array_values((array) $game['prizes']) : [];
        if (!$prizes) {
            return null;
        }
        $awarded = [];
        foreach (Db::getInstance()->executeS('SELECT prize, awarded FROM `' . _DB_PREFIX_ . 'popupstudio_prize` WHERE id_popup = ' . (int) $p['id']) ?: [] as $r) {
            $awarded[$r['prize']] = (int) $r['awarded'];
        }
        $pool = [];
        $total = 0;
        foreach ($prizes as $i => $pr) {
            $key = isset($pr['key']) ? (string) $pr['key'] : (string) $i;
            $stock = isset($pr['stock']) && $pr['stock'] !== '' ? (int) $pr['stock'] : -1;
            $w = max(0, (int) (isset($pr['weight']) ? $pr['weight'] : 1));
            if ($w === 0 || ($stock >= 0 && (isset($awarded[$key]) ? $awarded[$key] : 0) >= $stock)) {
                continue;
            }
            $pool[] = [$i, $key, $w];
            $total += $w;
        }
        if (!$pool) {
            return null;
        }
        $r = random_int(1, $total);
        foreach ($pool as $item) {
            $r -= $item[2];
            if ($r <= 0) {
                return ['index' => $item[0], 'key' => $item[1], 'prize' => $prizes[$item[0]]];
            }
        }

        return null;
    }

    private function play()
    {
        $p = $this->popup();
        if (!$p) {
            $this->reply(['ok' => false, 'error' => 'popup']);
        }
        $visitor = isset($this->context->cookie->psx_vid) ? (string) $this->context->cookie->psx_vid : '';
        $db = Db::getInstance();
        $prev = $visitor !== '' ? $db->getRow('SELECT * FROM `' . _DB_PREFIX_ . 'popupstudio_play` WHERE id_popup = ' . (int) $p['id'] . ' AND visitor = "' . pSQL($visitor) . '" ORDER BY id_play DESC') : null;
        if ($prev && (int) $prev['claimed'] === 0) {
            // Played before but never left an email: give back the same prize, no new draw.
            foreach ((array) (isset($p['settings']['game']['prizes']) ? $p['settings']['game']['prizes'] : []) as $i => $pr) {
                if ((isset($pr['key']) ? (string) $pr['key'] : (string) $i) === (string) $prev['prize']) {
                    $this->reply([
                        'ok' => true,
                        'index' => $i,
                        'key' => $prev['prize'],
                        'claim' => (int) $prev['id_play'] . '.' . hash_hmac('sha256', 'claim|' . (int) $prev['id_play'], (string) Configuration::get('POPUPSTUDIO_SECRET')),
                    ]);
                }
            }
        }
        if ($prev) {
            $this->reply(['ok' => false, 'error' => 'played']);
        }
        if ($this->tooMany('play', (int) $p['id'], 20)) {
            $this->reply(['ok' => false, 'error' => 'played']);
        }
        $res = $this->draw($p);
        if (!$res) {
            $this->reply(['ok' => false, 'error' => 'empty']);
        }
        $db->insert('popupstudio_play', [
            'id_popup' => (int) $p['id'],
            'visitor' => pSQL($visitor),
            'ip' => pSQL(Tools::getRemoteAddr()),
            'prize' => pSQL($res['key']),
            'date_add' => date('Y-m-d H:i:s'),
        ]);
        $idPlay = (int) $db->Insert_ID();
        $this->reply([
            'ok' => true,
            'index' => $res['index'],
            'key' => $res['key'],
            'claim' => $idPlay . '.' . hash_hmac('sha256', 'claim|' . $idPlay, (string) Configuration::get('POPUPSTUDIO_SECRET')),
        ]);
    }

    private function claimPlay($token, $idPopup)
    {
        $parts = explode('.', (string) $token, 2);
        if (count($parts) !== 2) {
            return null;
        }
        $id = (int) $parts[0];
        if (!hash_equals(hash_hmac('sha256', 'claim|' . $id, (string) Configuration::get('POPUPSTUDIO_SECRET')), $parts[1])) {
            return null;
        }
        $row = Db::getInstance()->getRow('SELECT * FROM `' . _DB_PREFIX_ . 'popupstudio_play` WHERE id_play = ' . $id . ' AND id_popup = ' . (int) $idPopup . ' AND claimed = 0');

        return $row ?: null;
    }

    private function subscribe()
    {
        $p = $this->popup();
        if (!$p) {
            $this->reply(['ok' => false, 'error' => 'popup']);
        }
        $s = $p['settings'];
        $email = Tools::strtolower(trim((string) Tools::getValue('email')));
        if (!Validate::isEmail($email)) {
            $this->reply(['ok' => false, 'error' => 'email']);
        }
        $form = isset($s['form']) ? (array) $s['form'] : [];
        $consent = (int) Tools::getValue('consent') === 1;
        if (!empty($form['consent']) && !empty($form['consentRequired']) && !$consent) {
            $this->reply(['ok' => false, 'error' => 'consent']);
        }
        if ($this->tooMany('lead', (int) $p['id'], 30)) {
            $this->reply(['ok' => false, 'error' => 'rate']);
        }
        $db = Db::getInstance();
        $idVariant = $this->variantId($p);
        $existing = $db->getRow('SELECT id_lead, coupon FROM `' . _DB_PREFIX_ . 'popupstudio_lead` WHERE id_popup = ' . (int) $p['id'] . ' AND email = "' . pSQL($email) . '"');

        // Prize: a claim token from an earlier play, or a draw now when the game asks for the email first.
        $prize = null;
        $play = null;
        if (Tools::getValue('claim')) {
            $play = $this->claimPlay((string) Tools::getValue('claim'), (int) $p['id']);
            if ($play) {
                foreach ((array) (isset($s['game']['prizes']) ? $s['game']['prizes'] : []) as $i => $pr) {
                    if ((isset($pr['key']) ? (string) $pr['key'] : (string) $i) === $play['prize']) {
                        $prize = ['index' => $i, 'key' => $play['prize'], 'prize' => $pr];
                    }
                }
            }
        } elseif ((int) Tools::getValue('play') === 1) {
            if ($existing) {
                $this->reply(['ok' => false, 'error' => 'played']);
            }
            $prize = $this->draw($p);
            if (!$prize) {
                $this->reply(['ok' => false, 'error' => 'empty']);
            }
            $db->insert('popupstudio_play', [
                'id_popup' => (int) $p['id'],
                'visitor' => pSQL(isset($this->context->cookie->psx_vid) ? (string) $this->context->cookie->psx_vid : ''),
                'ip' => pSQL(Tools::getRemoteAddr()),
                'prize' => pSQL($prize['key']),
                'claimed' => 1,
                'date_add' => date('Y-m-d H:i:s'),
            ]);
        }
        if ($existing && !$prize) {
            $this->reply(['ok' => true, 'state' => 'exists']);
        }

        // Newsletter, unless the form says signups only go to the leads list.
        $news = '';
        $list = isset($form['list']) ? (string) $form['list'] : 'newsletter';
        if (!$existing && $list === 'newsletter' && (empty($form['consent']) || $consent)) {
            $news = Newsletter::subscribe($email);
        }

        // Coupon: prize coupon, generated code, or fixed code.
        $coupon = ['code' => '', 'id_cart_rule' => 0, 'expires' => ''];
        $cfg = isset($s['coupon']) ? (array) $s['coupon'] : [];
        if ($prize) {
            $pc = isset($prize['prize']['coupon']) ? (array) $prize['prize']['coupon'] : [];
            if (!empty($pc['code'])) {
                $coupon['code'] = (string) $pc['code'];
            } elseif (!empty($pc['type'])) {
                $pc['prefix'] = !empty($pc['prefix']) ? $pc['prefix'] : (!empty($cfg['prefix']) && isset($cfg['mode']) && $cfg['mode'] === 'generated' ? $cfg['prefix'] : 'WIN-');
                $coupon = Coupons::generate($pc, $p['name'], $email, (int) $this->context->customer->id);
            }
            $db->execute('INSERT INTO `' . _DB_PREFIX_ . 'popupstudio_prize` (id_popup, prize, awarded) VALUES (' . (int) $p['id'] . ', "' . pSQL($prize['key']) . '", 1) ON DUPLICATE KEY UPDATE awarded = awarded + 1');
            if ($play) {
                $db->update('popupstudio_play', ['claimed' => 1], 'id_play = ' . (int) $play['id_play']);
            }
        } elseif (!empty($cfg['mode']) && $cfg['mode'] === 'generated') {
            $coupon = Coupons::generate($cfg, $p['name'], $email, (int) $this->context->customer->id);
        } elseif (!empty($cfg['mode']) && $cfg['mode'] === 'fixed' && !empty($cfg['code'])) {
            $coupon['code'] = (string) $cfg['code'];
            $coupon['id_cart_rule'] = (int) CartRule::getIdByCode((string) $cfg['code']);
        }

        $consentText = Tools::substr(strip_tags((string) Tools::getValue('consent_text')), 0, 2000);
        $extra = Tools::getValue('extra');
        $extra = is_string($extra) ? Tools::substr($extra, 0, 2000) : '';
        $lead = [
            'id_shop' => (int) $this->context->shop->id,
            'id_popup' => (int) $p['id'],
            'id_variant' => $idVariant,
            'email' => pSQL($email),
            'firstname' => pSQL(Tools::substr(trim(strip_tags((string) Tools::getValue('firstname'))), 0, 128)),
            'phone' => pSQL(Tools::substr(preg_replace('/[^0-9+ ()-]/', '', (string) Tools::getValue('phone')), 0, 32)),
            'id_lang' => (int) $this->context->language->id,
            'id_customer' => (int) $this->context->customer->id,
            'coupon' => pSQL($coupon['code']),
            'id_cart_rule' => (int) $coupon['id_cart_rule'],
            'newsletter' => pSQL($news),
            'consent' => (int) $consent,
            'consent_text' => Configuration::get('POPUPSTUDIO_CONSENT_LOG') ? pSQL($consentText) : '',
            'ip' => Configuration::get('POPUPSTUDIO_CONSENT_LOG') ? pSQL(Tools::getRemoteAddr()) : '',
            'extra' => pSQL($extra),
            'date_add' => date('Y-m-d H:i:s'),
        ];
        if ($existing) {
            $db->update('popupstudio_lead', ['coupon' => $lead['coupon'], 'id_cart_rule' => $lead['id_cart_rule']], 'id_lead = ' . (int) $existing['id_lead']);
        } else {
            $db->insert('popupstudio_lead', $lead);
            Stats::event((int) $p['id'], $idVariant, 'signup', (string) Tools::getValue('d'));
        }
        $this->context->cookie->psx_email = $email;
        if ($consent) {
            Gdpr::log((int) $this->module->id, (int) $this->context->customer->id, (int) $this->context->cookie->id_guest);
        }
        Webhook::send($p, $lead, $coupon);

        if (!empty($cfg['autoApply']) && $coupon['code'] !== '') {
            Coupons::applyToCart($coupon['code']);
        }

        $expires = '';
        if ($coupon['expires']) {
            $fmt = (string) $this->context->language->date_format_lite;
            $expires = date($fmt !== '' ? $fmt : 'Y-m-d', strtotime($coupon['expires']));
        }
        $this->reply([
            'ok' => true,
            'state' => $news === 'pending' ? 'pending' : 'ok',
            'coupon' => $coupon['code'],
            'expires' => $expires,
            'index' => $prize ? $prize['index'] : null,
            'key' => $prize ? $prize['key'] : null,
        ]);
    }

    private function apply()
    {
        $code = trim((string) Tools::getValue('code'));
        if ($code === '' || !Validate::isCleanHtml($code)) {
            $this->reply(['ok' => false]);
        }
        $known = (int) Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'popupstudio_lead` WHERE coupon = "' . pSQL($code) . '"');
        if (!$known) {
            foreach ((new Repository())->livePopups((int) $this->context->shop->id) as $p) {
                if (isset($p['settings']['coupon']['code']) && strcasecmp((string) $p['settings']['coupon']['code'], $code) === 0) {
                    $known = 1;
                }
            }
        }
        $this->reply(['ok' => $known ? Coupons::applyToCart($code) : false]);
    }
}
