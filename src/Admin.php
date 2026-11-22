<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */

namespace Iamshoaibktk\Popupstudio;

if (!defined('_PS_VERSION_')) {
    exit;
}

/**
 * Back-office helpers: boot data for the app, leads, settings, pickers, preview links, import/export.
 */
class Admin
{
    const SETTINGS = [
        'max_visit' => 'POPUPSTUDIO_MAX_PER_VISIT',
        'max_once' => 'POPUPSTUDIO_MAX_AT_ONCE',
        'count_bars' => 'POPUPSTUDIO_COUNT_BARS',
        'hide_bots' => 'POPUPSTUDIO_HIDE_BOTS',
        'ip_exclude' => 'POPUPSTUDIO_IP_EXCLUDE',
        'consent_log' => 'POPUPSTUDIO_CONSENT_LOG',
        'coupon_len' => 'POPUPSTUDIO_COUPON_LEN',
        'coupon_cleanup' => 'POPUPSTUDIO_COUPON_CLEANUP',
        'webhook_url' => 'POPUPSTUDIO_WEBHOOK_URL',
        'webhook_secret' => 'POPUPSTUDIO_WEBHOOK_SECRET',
        'lazy' => 'POPUPSTUDIO_LAZY',
        'reduced_motion' => 'POPUPSTUDIO_REDUCED_MOTION',
        'stats_months' => 'POPUPSTUDIO_STATS_MONTHS',
        'keep_data' => 'POPUPSTUDIO_KEEP_DATA',
        'attrib_days' => 'POPUPSTUDIO_ATTRIB_DAYS',
    ];

    public static function boot(\Module $module, \Context $c, $adminUrl)
    {
        $langs = [];
        foreach (\Language::getLanguages(false) as $l) {
            $langs[] = ['id' => (int) $l['id_lang'], 'iso' => (string) $l['iso_code'], 'name' => (string) $l['name'], 'active' => (int) $l['active']];
        }
        $shops = [];
        foreach (\Shop::getShops(false) as $s) {
            $shops[] = ['id' => (int) $s['id_shop'], 'name' => (string) $s['name']];
        }
        $groups = [];
        foreach (\Group::getGroups((int) $c->language->id) as $g) {
            $groups[] = ['id' => (int) $g['id_group'], 'name' => (string) $g['name']];
        }
        $countries = [];
        foreach (\Country::getCountries((int) $c->language->id, false) as $co) {
            $countries[] = ['iso' => (string) $co['iso_code'], 'name' => (string) $co['name']];
        }
        $currencies = [];
        foreach (\Currency::getCurrencies(false, true) as $cu) {
            $currencies[] = ['id' => (int) $cu['id_currency'], 'iso' => (string) $cu['iso_code']];
        }
        $ctxShops = \Shop::getContextListShopID();

        return [
            'api' => $adminUrl . '&psxapi=',
            'leadsCsv' => $adminUrl . '&export=leads',
            'version' => $module->version,
            'assetv' => $module->version . '-' . max(filemtime(_PS_MODULE_DIR_ . $module->name . '/views/js/render.js'), filemtime(_PS_MODULE_DIR_ . $module->name . '/views/css/front.css')),
            'ps' => _PS_VERSION_,
            'base' => $module->getPathUri(),
            'fonts' => $module->getPathUri() . 'views/fonts/',
            'fontFiles' => Repository::decode(is_file(_PS_MODULE_DIR_ . $module->name . '/views/fonts/fonts.json') ? (string) file_get_contents(_PS_MODULE_DIR_ . $module->name . '/views/fonts/fonts.json') : ''),
            'lang' => (string) $c->language->iso_code,
            'langs' => $langs,
            'defaultIso' => (string) \Language::getIsoById((int) \Configuration::get('PS_LANG_DEFAULT')),
            'shops' => $shops,
            'multistore' => \Shop::isFeatureActive(),
            'contextShops' => array_map('intval', $ctxShops),
            'groups' => $groups,
            'countries' => $countries,
            'currencies' => $currencies,
            'settings' => self::settings($module),
            'strings' => self::strings($module),
            'sample' => [
                'shop' => (string) \Configuration::get('PS_SHOP_NAME'),
                'currency' => ['sign' => (string) $c->currency->sign, 'iso' => (string) $c->currency->iso_code],
                'locale' => (string) $c->language->locale,
                'free_threshold' => (float) \Configuration::get('PS_SHIPPING_FREE_PRICE') ?: 60,
                'cart_total' => 45.5,
                'cart_items' => 3,
                'cart' => ['lines' => [], 'count' => 3, 'total' => 45.5, 'total_fmt' => ''],
            ],
            'author' => [
                'img' => $module->getPathUri() . 'views/img/author.jpg',
            ],
        ];
    }

    public static function settings(\Module $module)
    {
        $out = [];
        foreach (self::SETTINGS as $k => $cfg) {
            $out[$k] = \Configuration::get($cfg);
        }
        foreach (['max_visit', 'max_once', 'count_bars', 'hide_bots', 'consent_log', 'coupon_len', 'coupon_cleanup', 'lazy', 'reduced_motion', 'stats_months', 'keep_data', 'attrib_days'] as $k) {
            $out[$k] = (int) $out[$k];
        }
        $out['webhook_last'] = Repository::decode((string) \Configuration::get('POPUPSTUDIO_WEBHOOK_LAST'), null);
        $out['newsletter_module'] = (bool) Newsletter::module();
        $out['newsletter_verification'] = (int) \Configuration::get('NW_VERIFICATION_EMAIL');
        $out['gdpr_module'] = Gdpr::available();
        $out['gdpr_text'] = Gdpr::consentMessage((int) $module->id, (int) \Context::getContext()->language->id);
        $out['geolocation'] = (int) \Configuration::get('PS_GEOLOCATION_ENABLED');
        $out['links'] = [
            'geolocation' => \Context::getContext()->link->getAdminLink('AdminGeolocation'),
            'newsletter' => \Context::getContext()->link->getAdminLink('AdminModules', true, [], ['configure' => 'ps_emailsubscription']),
            'gdpr' => \Context::getContext()->link->getAdminLink('AdminModules', true, [], ['configure' => 'psgdpr']),
            'cartrules' => \Context::getContext()->link->getAdminLink('AdminCartRules'),
        ];

        return $out;
    }

    public static function saveSettings(array $b)
    {
        foreach (self::SETTINGS as $k => $cfg) {
            if (!array_key_exists($k, $b)) {
                continue;
            }
            $v = $b[$k];
            if (in_array($k, ['ip_exclude', 'webhook_url', 'webhook_secret'], true)) {
                $v = trim(strip_tags((string) $v));
                if ($k === 'webhook_url' && $v !== '' && !preg_match('#^https?://#i', $v)) {
                    continue;
                }
            } else {
                $v = max(0, (int) $v);
            }
            \Configuration::updateGlobalValue($cfg, $v);
        }
    }

    public static function strings(\Module $module)
    {
        $file = _PS_MODULE_DIR_ . $module->name . '/views/js/strings.json';
        $keys = is_file($file) ? Repository::decode((string) file_get_contents($file)) : [];
        $out = [];
        $t = $module->getTranslator();
        foreach ($keys as $k) {
            $out[$k] = $t->trans($k, [], 'Modules.Popupstudio.Admin');
        }

        return $out;
    }

    public static function listRows(Repository $repo)
    {
        $shop = \Shop::getContext() === \Shop::CONTEXT_SHOP ? (int) \Context::getContext()->shop->id : null;
        $rows = $repo->listPopups($shop);
        $sparks = Stats::sparks();
        foreach ($rows as &$r) {
            $r['stats'] = isset($sparks[$r['id']]) ? $sparks[$r['id']] : ['views' => 0, 'signups' => 0, 'clicks' => 0, 'orders' => 0, 'spark' => array_fill(0, 14, 0)];
            $first = \Db::getInstance()->getValue('SELECT content FROM `' . _DB_PREFIX_ . 'popupstudio_variant` WHERE id_popup = ' . (int) $r['id'] . ' ORDER BY position, id_variant');
            $doc = Repository::decode($first);
            $r['thumb'] = ['format' => isset($doc['format']) ? $doc['format'] : 'modal', 'theme' => isset($doc['theme']) ? $doc['theme'] : [], 'template' => isset($doc['template']) ? $doc['template'] : ''];
        }
        unset($r);

        return $rows;
    }

    public static function leads($page, $q, $idPopup, $coupon)
    {
        $db = \Db::getInstance();
        $where = '1';
        if ($q !== '') {
            $where .= ' AND (l.email LIKE "%' . pSQL($q) . '%" OR l.firstname LIKE "%' . pSQL($q) . '%")';
        }
        if ($idPopup) {
            $where .= ' AND l.id_popup = ' . (int) $idPopup;
        }
        if ($coupon === 'used') {
            $where .= ' AND l.coupon_used = 1';
        } elseif ($coupon === 'open') {
            $where .= ' AND l.coupon <> "" AND l.coupon_used = 0 AND (c.date_to IS NULL OR c.date_to >= NOW())';
        } elseif ($coupon === 'expired') {
            $where .= ' AND l.coupon <> "" AND l.coupon_used = 0 AND c.date_to < NOW()';
        }
        if (\Shop::getContext() === \Shop::CONTEXT_SHOP) {
            $where .= ' AND l.id_shop = ' . (int) \Context::getContext()->shop->id;
        }
        $per = 50;
        $page = max(1, (int) $page);
        $from = '`' . _DB_PREFIX_ . 'popupstudio_lead` l
            LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_popup` p ON p.id_popup = l.id_popup
            LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_variant` v ON v.id_variant = l.id_variant
            LEFT JOIN `' . _DB_PREFIX_ . 'cart_rule` c ON c.id_cart_rule = l.id_cart_rule
            LEFT JOIN `' . _DB_PREFIX_ . 'lang` lg ON lg.id_lang = l.id_lang';
        $total = (int) $db->getValue('SELECT COUNT(*) FROM ' . $from . ' WHERE ' . $where);
        $rows = $db->executeS('SELECT l.id_lead, l.email, l.firstname, l.coupon, l.coupon_used, l.newsletter, l.consent, l.date_add, l.extra,
                p.name popup, v.label variant, c.date_to, lg.name lang
            FROM ' . $from . ' WHERE ' . $where . ' ORDER BY l.id_lead DESC LIMIT ' . (($page - 1) * $per) . ', ' . $per) ?: [];

        return ['rows' => $rows, 'total' => $total, 'page' => $page, 'per' => $per];
    }

    public static function leadsCsv($idPopup)
    {
        $db = \Db::getInstance();
        $rows = $db->executeS('SELECT l.date_add, l.email, l.firstname, l.phone, p.name popup, v.label variant, l.coupon, l.coupon_used, l.newsletter, l.consent, l.consent_text, l.ip, l.extra
            FROM `' . _DB_PREFIX_ . 'popupstudio_lead` l
            LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_popup` p ON p.id_popup = l.id_popup
            LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_variant` v ON v.id_variant = l.id_variant
            WHERE 1' . ($idPopup ? ' AND l.id_popup = ' . (int) $idPopup : '') . ' ORDER BY l.id_lead DESC') ?: [];
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="popupstudio-leads-' . date('Y-m-d') . '.csv"');
        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF");
        fputcsv($out, ['date', 'email', 'firstname', 'phone', 'popup', 'variant', 'coupon', 'coupon_used', 'newsletter', 'consent', 'consent_text', 'ip', 'extra']);
        foreach ($rows as $r) {
            foreach ($r as $k => $v) {
                // Spreadsheet formula injection guard.
                if (is_string($v) && $v !== '' && in_array($v[0], ['=', '+', '-', '@'], true)) {
                    $r[$k] = "'" . $v;
                }
            }
            fputcsv($out, array_values($r));
        }
        fclose($out);
    }

    public static function search($kind, $q, \Context $c)
    {
        $db = \Db::getInstance();
        $idLang = (int) $c->language->id;
        $q = trim($q);
        $like = '"%' . pSQL($q) . '%"';
        if ($kind === 'product') {
            $rows = $db->executeS('SELECT p.id_product id, pl.name, p.reference FROM `' . _DB_PREFIX_ . 'product` p
                INNER JOIN `' . _DB_PREFIX_ . 'product_lang` pl ON pl.id_product = p.id_product AND pl.id_lang = ' . $idLang . ' AND pl.id_shop = ' . (int) $c->shop->id . '
                WHERE pl.name LIKE ' . $like . ' OR p.reference LIKE ' . $like . (ctype_digit($q) ? ' OR p.id_product = ' . (int) $q : '') . ' GROUP BY p.id_product LIMIT 20') ?: [];
        } elseif ($kind === 'category') {
            $rows = $db->executeS('SELECT c.id_category id, cl.name FROM `' . _DB_PREFIX_ . 'category` c
                INNER JOIN `' . _DB_PREFIX_ . 'category_lang` cl ON cl.id_category = c.id_category AND cl.id_lang = ' . $idLang . ' AND cl.id_shop = ' . (int) $c->shop->id . '
                WHERE c.id_parent > 0 AND cl.name LIKE ' . $like . ' LIMIT 20') ?: [];
        } elseif ($kind === 'cms') {
            $rows = $db->executeS('SELECT c.id_cms id, cl.meta_title name FROM `' . _DB_PREFIX_ . 'cms` c
                INNER JOIN `' . _DB_PREFIX_ . 'cms_lang` cl ON cl.id_cms = c.id_cms AND cl.id_lang = ' . $idLang . '
                WHERE cl.meta_title LIKE ' . $like . ' GROUP BY c.id_cms LIMIT 20') ?: [];
        } elseif ($kind === 'brand') {
            $rows = $db->executeS('SELECT id_manufacturer id, name FROM `' . _DB_PREFIX_ . 'manufacturer` WHERE name LIKE ' . $like . ' LIMIT 20') ?: [];
        } else {
            $rows = [];
        }
        foreach ($rows as &$r) {
            $r['id'] = (int) $r['id'];
        }

        return $rows;
    }

    public static function previewUrl($id, $debug, $variant, \Context $c)
    {
        $url = $c->link->getPageLink('index', true);
        $params = [
            'psx_preview' => (int) $id,
            'psx_key' => Front::previewKey((int) $id, (string) \Configuration::get('POPUPSTUDIO_SECRET')),
        ];
        if ($debug) {
            $params['psx_debug'] = 1;
        }
        if ($variant) {
            $params['psx_variant'] = (int) $variant;
        }

        return $url . (strpos($url, '?') === false ? '?' : '&') . http_build_query($params);
    }

    public static function export(Repository $repo, array $ids)
    {
        $out = ['format' => 'popupstudio', 'version' => 1, 'exported' => date('c'), 'popups' => []];
        foreach ($ids ?: array_column($repo->listPopups(), 'id') as $id) {
            $p = $repo->getPopup((int) $id);
            if (!$p) {
                continue;
            }
            unset($p['id'], $p['shops'], $p['date_add'], $p['date_upd'], $p['position']);
            foreach ($p['variants'] as &$v) {
                unset($v['id_variant']);
            }
            unset($v);
            $out['popups'][] = $p;
        }

        return $out;
    }

    public static function import(Repository $repo, array $b)
    {
        $ids = [];
        if (!isset($b['format']) || $b['format'] !== 'popupstudio' || empty($b['popups']) || !is_array($b['popups'])) {
            return $ids;
        }
        foreach ($b['popups'] as $p) {
            if (!is_array($p)) {
                continue;
            }
            unset($p['id']);
            $p['status'] = 'draft';
            $ids[] = $repo->save($p);
        }

        return $ids;
    }
}
