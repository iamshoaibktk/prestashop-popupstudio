<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk@gmail.com (WhatsApp: +923459016286)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */

namespace Iamshoaibktk\Popupstudio;

if (!defined('_PS_VERSION_')) {
    exit;
}

/**
 * Targeting rules. Groups are OR-ed, rules inside a group are AND-ed.
 * Rules that need the browser (device, UTM, referrer, first visit) are handed to the storefront script.
 */
class Rules
{
    const CLIENT = ['device', 'utm', 'referrer', 'visit'];

    /** @var array */
    private $ctx;

    public function __construct(array $ctx)
    {
        $this->ctx = $ctx;
    }

    /**
     * Build the request context once per page.
     */
    public static function context(\Context $c, $controller = null)
    {
        $page = 'other';
        if ($controller && isset($controller->php_self) && $controller->php_self) {
            $page = (string) $controller->php_self;
        } elseif ($controller instanceof \ModuleFrontController) {
            $page = 'module';
        }
        $map = ['index' => 'home', 'order' => 'checkout', 'order-opc' => 'checkout', 'order-confirmation' => 'confirmation', 'search' => 'search', 'pagenotfound' => 'notfound'];
        if (isset($map[$page])) {
            $page = $map[$page];
        }
        $cats = [];
        $idProduct = 0;
        $idCategory = 0;
        $idCms = 0;
        if ($page === 'product') {
            $idProduct = (int) \Tools::getValue('id_product');
            $cats = array_map('intval', (array) \Product::getProductCategories($idProduct));
        } elseif ($page === 'category') {
            $idCategory = (int) \Tools::getValue('id_category');
            $cats = [$idCategory];
        } elseif ($page === 'cms') {
            $idCms = (int) \Tools::getValue('id_cms');
        }

        $customer = $c->customer;
        $logged = $customer && $customer->isLogged();
        $guest = $logged && (int) $customer->is_guest === 1;
        $orders = 0;
        if ($customer && $customer->id) {
            $orders = (int) \Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'orders` WHERE id_customer = ' . (int) $customer->id . ' AND valid = 1');
        }
        $groups = [];
        if ($customer && $customer->id) {
            $groups = array_map('intval', (array) \Customer::getGroupsStatic((int) $customer->id));
        } else {
            $groups = [(int) \Configuration::get($logged ? 'PS_CUSTOMER_GROUP' : 'PS_UNIDENTIFIED_GROUP')];
        }

        $cart = $c->cart;
        $cartTotal = 0.0;
        $cartItems = 0;
        $cartProducts = [];
        $cartCats = [];
        $cartBrands = [];
        if ($cart && $cart->id) {
            $cartTotal = (float) $cart->getOrderTotal(true, \Cart::ONLY_PRODUCTS);
            foreach ($cart->getProducts() as $p) {
                $cartItems += (int) $p['cart_quantity'];
                $cartProducts[] = (int) $p['id_product'];
                $cartBrands[] = (int) $p['id_manufacturer'];
                foreach ((array) \Product::getProductCategories((int) $p['id_product']) as $cid) {
                    $cartCats[] = (int) $cid;
                }
            }
        }

        $country = '';
        if ($logged && $cart && $cart->id_address_delivery) {
            $addr = new \Address((int) $cart->id_address_delivery);
            if ($addr->id_country) {
                $country = (string) \Country::getIsoById((int) $addr->id_country);
            }
        }
        if ($country === '' && \Configuration::get('PS_GEOLOCATION_ENABLED') && $c->country && $c->country->iso_code) {
            $country = (string) $c->country->iso_code;
        }

        return [
            'page' => $page,
            'id_product' => $idProduct,
            'id_category' => $idCategory,
            'id_cms' => $idCms,
            'cats' => $cats,
            'url' => isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '',
            'logged' => $logged,
            'guest' => $guest,
            'orders' => $orders,
            'groups' => $groups,
            'subscribed' => self::isSubscribed($c),
            'cart_total' => $cartTotal,
            'cart_items' => $cartItems,
            'cart_products' => array_values(array_unique($cartProducts)),
            'cart_cats' => array_values(array_unique($cartCats)),
            'cart_brands' => array_values(array_unique($cartBrands)),
            'country' => strtoupper($country),
            'id_lang' => (int) $c->language->id,
            'id_currency' => (int) $c->currency->id,
            'dow' => (int) date('N'),
            'hm' => date('H:i'),
        ];
    }

    private static function isSubscribed(\Context $c)
    {
        if ($c->customer && $c->customer->id) {
            if ((int) $c->customer->newsletter === 1) {
                return true;
            }
            $email = (string) $c->customer->email;
        } else {
            $email = isset($c->cookie->psx_email) ? (string) $c->cookie->psx_email : '';
        }
        if ($email === '') {
            return false;
        }

        return Newsletter::isRegistered($email, (int) $c->shop->id);
    }

    /**
     * Evaluate targeting. Returns ['pass' => bool, 'client' => groups of browser rules, 'trace' => [...]].
     */
    public function evaluate(array $targeting)
    {
        $groups = isset($targeting['groups']) && is_array($targeting['groups']) ? $targeting['groups'] : [];
        $groups = array_values(array_filter($groups, function ($g) {
            return !empty($g['rules']);
        }));
        if (!$groups) {
            return ['pass' => true, 'client' => [], 'trace' => []];
        }
        $client = [];
        $trace = [];
        $any = false;
        foreach ($groups as $gi => $g) {
            $ok = true;
            $browser = [];
            foreach ($g['rules'] as $rule) {
                $type = isset($rule['type']) ? (string) $rule['type'] : '';
                if (in_array($type, self::CLIENT, true)) {
                    $browser[] = $rule;
                    continue;
                }
                list($res, $why) = $this->rule($rule);
                $trace[] = ['group' => $gi + 1, 'type' => $type, 'pass' => $res, 'why' => $why];
                if (!$res) {
                    $ok = false;
                }
            }
            if ($ok) {
                $any = true;
                $client[] = $browser;
            }
        }

        return ['pass' => $any, 'client' => $client, 'trace' => $trace];
    }

    /**
     * @return array [bool, string]
     */
    private function rule(array $r)
    {
        $c = $this->ctx;
        $op = isset($r['op']) ? (string) $r['op'] : '';
        $val = isset($r['value']) ? $r['value'] : null;
        $list = is_array($val) ? $val : ($val === null || $val === '' ? [] : [$val]);
        switch (isset($r['type']) ? $r['type'] : '') {
            case 'audience':
                $want = (string) $val;
                $map = [
                    'visitor' => !$c['logged'],
                    'guest' => $c['guest'],
                    'customer' => $c['logged'] && !$c['guest'],
                    'logged' => $c['logged'],
                ];
                $res = isset($map[$want]) ? $map[$want] : true;

                return [$res, $want];
            case 'group':
                $hit = (bool) array_intersect(array_map('intval', $list), $c['groups']);

                return [$op === 'none' ? !$hit : $hit, 'groups ' . implode(',', $c['groups'])];
            case 'orders':
                $n = (int) (isset($r['n']) ? $r['n'] : 1);
                if ($op === 'none') {
                    return [$c['orders'] === 0, $c['orders'] . ' orders'];
                }

                return [$c['orders'] >= max(1, $n), $c['orders'] . ' orders'];
            case 'newsletter':
                return [$op === 'subscribed' ? $c['subscribed'] : !$c['subscribed'], $c['subscribed'] ? 'subscribed' : 'not subscribed'];
            case 'cart_value':
                $a = (float) (isset($r['a']) ? $r['a'] : 0);
                $b = (float) (isset($r['b']) ? $r['b'] : 0);
                $t = $c['cart_total'];
                $res = $op === 'lt' ? $t < $a : ($op === 'between' ? ($t >= $a && $t <= $b) : $t > $a);

                return [$res, 'cart ' . round($t, 2)];
            case 'cart_items':
                $a = (int) (isset($r['a']) ? $r['a'] : 0);
                $res = $op === 'lt' ? $c['cart_items'] < $a : $c['cart_items'] >= max(1, $a);

                return [$res, $c['cart_items'] . ' items'];
            case 'cart_contains':
                $hit = (bool) array_intersect(array_map('intval', isset($r['products']) ? (array) $r['products'] : []), $c['cart_products'])
                    || (bool) array_intersect(array_map('intval', isset($r['categories']) ? (array) $r['categories'] : []), $c['cart_cats'])
                    || (bool) array_intersect(array_map('intval', isset($r['brands']) ? (array) $r['brands'] : []), $c['cart_brands']);

                return [$op === 'none' ? !$hit : $hit, $hit ? 'match in cart' : 'no match in cart'];
            case 'page':
                $pages = isset($r['pages']) ? (array) $r['pages'] : [];
                $cats = array_map('intval', isset($r['categories']) ? (array) $r['categories'] : []);
                $prods = array_map('intval', isset($r['products']) ? (array) $r['products'] : []);
                $cms = array_map('intval', isset($r['cms']) ? (array) $r['cms'] : []);
                $hit = in_array('all', $pages, true) || in_array($c['page'], $pages, true)
                    || ($cats && array_intersect($cats, $c['cats']))
                    || ($prods && in_array($c['id_product'], $prods, true))
                    || ($cms && in_array($c['id_cms'], $cms, true));

                return [$op === 'except' ? !$hit : (bool) $hit, 'page ' . $c['page']];
            case 'url':
                $needle = (string) $val;
                if ($op === 'regex') {
                    $res = $needle !== '' && @preg_match('#' . str_replace('#', '\#', $needle) . '#i', $c['url']) === 1;
                } else {
                    $res = $needle !== '' && stripos($c['url'], $needle) !== false;
                    if ($op === 'not_contains') {
                        $res = !$res;
                    }
                }

                return [$res, $c['url']];
            case 'country':
                if ($c['country'] === '') {
                    return [$op === 'none', 'country unknown'];
                }
                $hit = in_array($c['country'], array_map('strtoupper', $list), true);

                return [$op === 'none' ? !$hit : $hit, 'country ' . $c['country']];
            case 'language':
                $hit = in_array($c['id_lang'], array_map('intval', $list), true);

                return [$op === 'none' ? !$hit : $hit, 'lang ' . $c['id_lang']];
            case 'currency':
                $hit = in_array($c['id_currency'], array_map('intval', $list), true);

                return [$op === 'none' ? !$hit : $hit, 'currency ' . $c['id_currency']];
            case 'daytime':
                $days = array_map('intval', isset($r['days']) ? (array) $r['days'] : [1, 2, 3, 4, 5, 6, 7]);
                $from = isset($r['from']) ? (string) $r['from'] : '00:00';
                $to = isset($r['to']) ? (string) $r['to'] : '23:59';
                $res = in_array($c['dow'], $days, true) && $c['hm'] >= $from && $c['hm'] <= $to;

                return [$res, 'day ' . $c['dow'] . ' ' . $c['hm']];
        }

        return [true, 'unknown rule ignored'];
    }

    /**
     * Schedule from the popup settings: days of the week and hours.
     */
    public function schedule(array $s)
    {
        if (!$s) {
            return true;
        }
        $days = isset($s['days']) && is_array($s['days']) && $s['days'] ? array_map('intval', $s['days']) : [1, 2, 3, 4, 5, 6, 7];
        $from = !empty($s['from']) ? (string) $s['from'] : '00:00';
        $to = !empty($s['to']) ? (string) $s['to'] : '23:59';

        return in_array($this->ctx['dow'], $days, true) && $this->ctx['hm'] >= $from && $this->ctx['hm'] <= $to;
    }
}
