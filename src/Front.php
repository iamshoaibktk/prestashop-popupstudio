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
 * Decides which popups this page may show and hands them to the storefront script.
 * Server-side rules run here; browser rules, triggers and frequency run in views/js/front.js.
 */
class Front
{
    const BOTS = '/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pagespeed|gtmetrix|curl|wget/i';

    /** @var array|null|false */
    private static $payload;

    /** @var int[] */
    private static $inline = [];

    public static function setMedia(\Module $module)
    {
        $data = self::payload($module);
        if (!$data || (!$data['popups'] && !self::$inline)) {
            return;
        }
        $c = \Context::getContext();
        $dir = _PS_MODULE_DIR_ . $module->name . '/views/';
        $v = $module->version . '-' . max(filemtime($dir . 'js/front.js'), filemtime($dir . 'js/render.js'), filemtime($dir . 'css/front.css'));
        $c->controller->registerStylesheet('popupstudio-front', 'modules/' . $module->name . '/views/css/front.css', ['media' => 'all', 'priority' => 200, 'version' => $v]);
        $c->controller->registerJavascript('popupstudio-render', 'modules/' . $module->name . '/views/js/render.js', ['position' => 'bottom', 'priority' => 200, 'attributes' => 'defer', 'version' => $v]);
        $c->controller->registerJavascript('popupstudio-front', 'modules/' . $module->name . '/views/js/front.js', ['position' => 'bottom', 'priority' => 201, 'attributes' => 'defer', 'version' => $v]);
    }

    public static function output(\Module $module)
    {
        $data = self::payload($module);
        if (!$data || !$data['popups']) {
            return '';
        }
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

        return '<script type="application/json" id="psx-config">' . $json . '</script>';
    }

    public static function inline(\Module $module, $id, $hook)
    {
        $id = (int) $id;
        if ($id <= 0) {
            return '';
        }
        self::$inline[] = $id;

        return '<div class="psx-inline" data-psx-inline="' . $id . '"></div>';
    }

    /**
     * @return array|null
     */
    public static function payload(\Module $module)
    {
        if (self::$payload !== null) {
            return self::$payload ?: null;
        }
        self::$payload = false;
        $c = \Context::getContext();
        if (!$c->controller || !in_array($c->controller->controller_type, ['front', 'modulefront'], true)) {
            return null;
        }
        if ($c->controller instanceof \ModuleFrontController && $c->controller->module && $c->controller->module->name === $module->name) {
            return null;
        }
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
        if (\Configuration::get('POPUPSTUDIO_HIDE_BOTS') && ($ua === '' || preg_match(self::BOTS, $ua))) {
            return null;
        }
        if (self::ipExcluded(\Tools::getRemoteAddr(), (string) \Configuration::get('POPUPSTUDIO_IP_EXCLUDE'))) {
            return null;
        }

        $secret = (string) \Configuration::get('POPUPSTUDIO_SECRET');
        $preview = (int) \Tools::getValue('psx_preview');
        $previewOk = $preview > 0 && hash_equals(self::previewKey($preview, $secret), (string) \Tools::getValue('psx_key'));
        $debug = $previewOk && (int) \Tools::getValue('psx_debug') === 1;

        if (empty($c->cookie->psx_vid)) {
            $c->cookie->psx_vid = \Tools::passwdGen(24);
        }
        $vmap = Repository::decode(isset($c->cookie->psx_vmap) ? (string) $c->cookie->psx_vmap : '');

        $repo = new Repository();
        $rows = $repo->livePopups((int) $c->shop->id);
        if ($previewOk && !self::has($rows, $preview)) {
            $p = $repo->getPopup($preview);
            if ($p) {
                $rows[] = $p;
            }
        }
        $ctx = Rules::context($c, $c->controller);
        $rules = new Rules($ctx);
        $iso = (string) $c->language->iso_code;
        $defIso = (string) \Language::getIsoById((int) \Configuration::get('PS_LANG_DEFAULT'));

        $out = [];
        $trace = [];
        $needProducts = [];
        $needCart = false;
        foreach ($rows as $p) {
            $s = $p['settings'];
            $isPreview = $previewOk && (int) $p['id'] === $preview;
            $ev = $rules->evaluate(isset($s['targeting']) ? (array) $s['targeting'] : []);
            $sched = $rules->schedule(isset($s['schedule']) ? (array) $s['schedule'] : []);
            if ($debug) {
                $trace[(int) $p['id']] = ['name' => $p['name'], 'schedule' => $sched, 'rules' => $ev['trace'], 'pass' => $ev['pass'] && $sched, 'client' => $ev['client']];
            }
            if (!$isPreview && (!$ev['pass'] || !$sched)) {
                continue;
            }
            $variant = self::pickVariant($p, $vmap, $isPreview ? (int) \Tools::getValue('psx_variant') : 0);
            if (!$variant) {
                continue;
            }
            $doc = self::resolveLang($variant['content'], $iso, $defIso);
            self::collectNeeds($doc, $needProducts, $needCart);
            $out[] = [
                'id' => (int) $p['id'],
                'v' => (int) $variant['id_variant'],
                'name' => $p['name'],
                'priority' => (int) $p['priority'],
                'preview' => $isPreview,
                'client' => $isPreview ? [] : $ev['client'],
                'triggers' => isset($s['triggers']) ? $s['triggers'] : [],
                'close' => isset($s['close']) ? $s['close'] : [],
                'frequency' => $isPreview ? ['mode' => 'page'] : (isset($s['frequency']) ? $s['frequency'] : []),
                'teaser' => self::resolveLang(isset($s['teaser']) ? $s['teaser'] : [], $iso, $defIso),
                'game' => isset($s['game']) ? self::publicGame($s['game'], $iso, $defIso) : null,
                'startClosed' => !empty($s['startClosed']),
                'fixed' => isset($s['coupon']['mode']) && $s['coupon']['mode'] === 'fixed' ? (string) $s['coupon']['code'] : '',
                'doc' => $doc,
                'inline' => in_array((int) $p['id'], self::$inline, true),
            ];
        }
        $c->cookie->psx_vmap = Repository::json($vmap);

        $free = (float) \Configuration::get('PS_SHIPPING_FREE_PRICE');
        if ($free > 0 && $c->currency) {
            $free = (float) \Tools::convertPrice($free, $c->currency);
        }

        self::$payload = [
            'api' => $c->link->getModuleLink($module->name, 'api', [], true),
            'token' => \Tools::getToken(false),
            'lang' => $iso,
            'cap' => [
                'visit' => (int) \Configuration::get('POPUPSTUDIO_MAX_PER_VISIT'),
                'once' => max(1, (int) \Configuration::get('POPUPSTUDIO_MAX_AT_ONCE')),
                'bars' => (int) \Configuration::get('POPUPSTUDIO_COUNT_BARS'),
            ],
            'motion' => (int) \Configuration::get('POPUPSTUDIO_REDUCED_MOTION'),
            'fonts' => __PS_BASE_URI__ . 'modules/' . $module->name . '/views/fonts/',
            'fontFiles' => self::fontFiles($module, $out),
            'data' => self::data($c, $ctx, $free, $needProducts, $needCart),
            'popups' => $out,
            'debug' => $debug ? $trace : null,
            'i18n' => self::frontStrings($module),
        ];

        return self::$payload;
    }

    /**
     * Font files used by the popups on this page only (from views/fonts/fonts.json).
     */
    public static function fontFiles(\Module $module, array $popups)
    {
        $file = _PS_MODULE_DIR_ . $module->name . '/views/fonts/fonts.json';
        if (!$popups || !is_file($file)) {
            return null;
        }
        $all = Repository::decode((string) file_get_contents($file));
        $out = [];
        foreach ($popups as $p) {
            $list = isset($p['doc']['fonts']) ? (array) $p['doc']['fonts'] : [];
            foreach (['fh', 'fb'] as $k) {
                if (!empty($p['doc']['theme'][$k])) {
                    $list[] = (string) $p['doc']['theme'][$k];
                }
            }
            foreach ($list as $spec) {
                $fam = explode(':', (string) $spec)[0];
                if (isset($all[$fam])) {
                    $out[$fam] = $all[$fam];
                }
            }
        }

        return $out ?: null;
    }

    public static function previewKey($id, $secret)
    {
        return hash_hmac('sha256', 'preview|' . (int) $id . '|' . date('Y-m-d'), (string) $secret);
    }

    private static function has(array $rows, $id)
    {
        foreach ($rows as $r) {
            if ((int) $r['id'] === (int) $id) {
                return true;
            }
        }

        return false;
    }

    private static function pickVariant(array $p, array &$vmap, $forced)
    {
        $vars = $p['variants'];
        if (!$vars) {
            return null;
        }
        if ($forced) {
            foreach ($vars as $v) {
                if ((int) $v['id_variant'] === $forced) {
                    return $v;
                }
            }
        }
        if (!$p['ab_active'] || count($vars) === 1) {
            return $vars[0];
        }
        $key = (string) $p['id'];
        if (isset($vmap[$key])) {
            foreach ($vars as $v) {
                if ((int) $v['id_variant'] === (int) $vmap[$key]) {
                    return $v;
                }
            }
        }
        $total = 0;
        foreach ($vars as $v) {
            $total += max(0, (int) $v['weight']);
        }
        $pick = $vars[0];
        if ($total > 0) {
            $r = random_int(1, $total);
            foreach ($vars as $v) {
                $r -= max(0, (int) $v['weight']);
                if ($r <= 0) {
                    $pick = $v;
                    break;
                }
            }
        }
        $vmap[$key] = (int) $pick['id_variant'];

        return $pick;
    }

    /**
     * Texts are stored as {"en": "...", "fr": "..."}; keep only the visitor's language.
     */
    public static function resolveLang($node, $iso, $defIso)
    {
        if (!is_array($node)) {
            return $node;
        }
        if ($node && self::isLangMap($node)) {
            foreach ([$iso, $defIso, 'en'] as $k) {
                if (isset($node[$k]) && $node[$k] !== '') {
                    return $node[$k];
                }
            }
            $first = reset($node);

            return is_string($first) ? $first : '';
        }
        foreach ($node as $k => $v) {
            $node[$k] = self::resolveLang($v, $iso, $defIso);
        }

        return $node;
    }

    private static function isLangMap(array $a)
    {
        foreach ($a as $k => $v) {
            if (!is_string($k) || !preg_match('/^[a-z]{2}$/', $k) || !(is_string($v) || $v === null)) {
                return false;
            }
        }

        return true;
    }

    private static function publicGame($g, $iso, $defIso)
    {
        $prizes = [];
        foreach (isset($g['prizes']) ? (array) $g['prizes'] : [] as $i => $p) {
            $prizes[] = [
                'key' => isset($p['key']) ? (string) $p['key'] : (string) $i,
                'label' => self::resolveLang(isset($p['label']) ? $p['label'] : '', $iso, $defIso),
                'color' => isset($p['color']) ? (string) $p['color'] : '',
                'ink' => isset($p['ink']) ? (string) $p['ink'] : '',
            ];
        }

        return ['type' => isset($g['type']) ? (string) $g['type'] : 'wheel', 'prizes' => $prizes, 'emailFirst' => !empty($g['emailFirst'])];
    }

    private static function collectNeeds($node, array &$products, &$cart)
    {
        if (!is_array($node)) {
            return;
        }
        if (isset($node['type']) && $node['type'] === 'product') {
            $products[] = [isset($node['source']) ? (string) $node['source'] : 'fixed', (int) (isset($node['id_product']) ? $node['id_product'] : 0)];
        }
        if (isset($node['type']) && in_array($node['type'], ['cart', 'meter', 'ladder'], true)) {
            $cart = true;
        }
        foreach ($node as $v) {
            if (is_array($v)) {
                self::collectNeeds($v, $products, $cart);
            }
        }
    }

    /**
     * Live values for dynamic tags and for the product, cart and meter blocks.
     */
    private static function data(\Context $c, array $ctx, $free, array $needProducts, $needCart)
    {
        $d = [
            'shop' => (string) \Configuration::get('PS_SHOP_NAME'),
            'firstname' => $c->customer && $c->customer->isLogged() ? (string) $c->customer->firstname : '',
            'cart_total' => round($ctx['cart_total'], 2),
            'cart_items' => $ctx['cart_items'],
            'free_threshold' => round((float) $free, 2),
            'currency' => ['sign' => $c->currency ? (string) $c->currency->sign : '', 'iso' => $c->currency ? (string) $c->currency->iso_code : ''],
            'locale' => (string) $c->language->locale,
            'page' => $ctx['page'],
            'last_category' => '',
            'last_category_url' => '',
            'cart_url' => $c->link->getPageLink('cart', true, null, ['action' => 'show']),
            'checkout_url' => $c->link->getPageLink('order', true),
        ];
        $catId = $ctx['page'] === 'category' ? (int) $ctx['id_category'] : (int) (isset($c->cookie->psx_lastcat) ? $c->cookie->psx_lastcat : 0);
        if ($ctx['page'] === 'category' && $catId) {
            $c->cookie->psx_lastcat = $catId;
        }
        if ($catId) {
            $cat = new \Category($catId, (int) $c->language->id);
            if (\Validate::isLoadedObject($cat)) {
                $d['last_category'] = (string) $cat->name;
                $d['last_category_url'] = $c->link->getCategoryLink($cat);
            }
        }
        if ($needCart) {
            $d['cart'] = self::cart($c);
        }
        if ($needProducts) {
            $d['products'] = [];
            foreach ($needProducts as $np) {
                $prod = self::product($c, $np[0], $np[1], $ctx);
                if ($prod) {
                    $d['products'][$np[0] . ':' . $np[1]] = $prod;
                }
            }
        }

        return $d;
    }

    public static function cart(\Context $c)
    {
        $lines = [];
        $total = 0.0;
        $count = 0;
        $locale = \Tools::getContextLocale($c);
        $iso = $c->currency ? $c->currency->iso_code : 'EUR';
        if ($c->cart && $c->cart->id) {
            $total = (float) $c->cart->getOrderTotal(true, \Cart::ONLY_PRODUCTS);
            $products = $c->cart->getProducts();
            foreach ($products as $i => $p) {
                $count += (int) $p['cart_quantity'];
                if ($i >= 4) {
                    continue;
                }
                $imgId = 0;
                if (!empty($p['id_image'])) {
                    $parts = explode('-', (string) $p['id_image']);
                    $imgId = (int) end($parts);
                }
                if (!$imgId) {
                    $cover = \Product::getCover((int) $p['id_product']);
                    $imgId = $cover ? (int) $cover['id_image'] : 0;
                }
                $lines[] = [
                    'name' => (string) $p['name'],
                    'attrs' => isset($p['attributes_small']) ? (string) $p['attributes_small'] : '',
                    'qty' => (int) $p['cart_quantity'],
                    'total' => $locale->formatPrice((float) $p['total_wt'], $iso),
                    'img' => $imgId ? $c->link->getImageLink((string) $p['link_rewrite'], (string) $imgId, \ImageType::getFormattedName('small')) : '',
                ];
            }
        }

        return ['lines' => $lines, 'count' => $count, 'total' => round($total, 2), 'total_fmt' => $locale->formatPrice($total, $iso)];
    }

    private static function product(\Context $c, $source, $id, array $ctx)
    {
        $idLang = (int) $c->language->id;
        if ($source === 'viewed') {
            $viewed = isset($c->cookie->viewed) ? array_filter(array_map('intval', explode(',', (string) $c->cookie->viewed))) : [];
            $id = $viewed ? (int) end($viewed) : 0;
        } elseif ($source === 'bestseller') {
            $sql = 'SELECT ps.id_product FROM `' . _DB_PREFIX_ . 'product_sale` ps INNER JOIN `' . _DB_PREFIX_ . 'product_shop` p ON p.id_product = ps.id_product AND p.id_shop = ' . (int) $c->shop->id . ' AND p.active = 1';
            if ($ctx['id_category']) {
                $sql .= ' INNER JOIN `' . _DB_PREFIX_ . 'category_product` cp ON cp.id_product = ps.id_product AND cp.id_category = ' . (int) $ctx['id_category'];
            }
            $id = (int) \Db::getInstance()->getValue($sql . ' ORDER BY ps.quantity DESC');
            if (!$id) {
                $id = (int) \Db::getInstance()->getValue('SELECT id_product FROM `' . _DB_PREFIX_ . 'product_shop` WHERE active = 1 AND id_shop = ' . (int) $c->shop->id . ' ORDER BY id_product');
            }
        }
        if ($id <= 0) {
            return null;
        }
        $p = new \Product($id, false, $idLang, (int) $c->shop->id);
        if (!\Validate::isLoadedObject($p) || !$p->active) {
            return null;
        }
        $cover = \Product::getCover($id);
        $locale = \Tools::getContextLocale($c);

        return [
            'id' => $id,
            'name' => (string) $p->name,
            'price' => $locale->formatPrice(\Product::getPriceStatic($id, true), $c->currency->iso_code),
            'url' => $c->link->getProductLink($p),
            'img' => $cover ? $c->link->getImageLink((string) $p->link_rewrite, (string) $cover['id_image'], \ImageType::getFormattedName('home')) : '',
            'qty' => (int) \StockAvailable::getQuantityAvailableByProduct($id),
        ];
    }

    private static function ipExcluded($ip, $list)
    {
        if ($list === '' || $ip === '') {
            return false;
        }
        foreach (preg_split('/[\s,]+/', $list) as $entry) {
            $entry = trim($entry);
            if ($entry === '') {
                continue;
            }
            if (strpos($entry, '/') === false) {
                if ($entry === $ip) {
                    return true;
                }
                continue;
            }
            list($net, $bits) = explode('/', $entry, 2);
            $ipL = ip2long($ip);
            $netL = ip2long($net);
            if ($ipL !== false && $netL !== false) {
                $mask = -1 << (32 - (int) $bits);
                if (($ipL & $mask) === ($netL & $mask)) {
                    return true;
                }
            }
        }

        return false;
    }

    private static function frontStrings(\Module $m)
    {
        $d = 'Modules.Popupstudio.Shop';
        $t = $m->getTranslator();

        return [
            'close' => $t->trans('Close', [], $d),
            'copy' => $t->trans('Copy', [], $d),
            'copied' => $t->trans('Copied', [], $d),
            'sending' => $t->trans('Sending…', [], $d),
            'email_invalid' => $t->trans('That address looks incomplete. Please check it.', [], $d),
            'consent_needed' => $t->trans('Please tick the box to agree first.', [], $d),
            'exists' => $t->trans('This address is already on our list.', [], $d),
            'pending' => $t->trans('Almost done: please confirm the email we just sent you.', [], $d),
            'error' => $t->trans('Something went wrong. Please try again.', [], $d),
            'played' => $t->trans('You have already played this game.', [], $d),
            'applied' => $t->trans('Applied to your cart.', [], $d),
            'days' => $t->trans('days', [], $d),
            'hours' => $t->trans('hours', [], $d),
            'minutes' => $t->trans('minutes', [], $d),
            'seconds' => $t->trans('seconds', [], $d),
            'pause' => $t->trans('Pause', [], $d),
            'play' => $t->trans('Play', [], $d),
        ];
    }
}
