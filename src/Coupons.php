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
 * Coupons: a fixed code, or one cart rule created per signup or per prize.
 */
class Coupons
{
    /**
     * @param array $cfg type percent|amount|shipping, value, days, min, prefix
     *
     * @return array ['code' => string, 'id_cart_rule' => int, 'expires' => 'Y-m-d H:i:s']
     */
    public static function generate(array $cfg, $popupName, $email = '', $idCustomer = 0)
    {
        $type = isset($cfg['type']) ? (string) $cfg['type'] : 'percent';
        $value = max(0, (float) (isset($cfg['value']) ? $cfg['value'] : 10));
        $days = max(1, min(365, (int) (isset($cfg['days']) ? $cfg['days'] : 14)));
        $min = max(0, (float) (isset($cfg['min']) ? $cfg['min'] : 0));
        $prefix = strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) (isset($cfg['prefix']) ? $cfg['prefix'] : 'POP-')));
        $len = max(4, min(16, (int) \Configuration::get('POPUPSTUDIO_COUPON_LEN') ?: 8));

        $code = '';
        for ($i = 0; $i < 8; ++$i) {
            $code = \Tools::substr($prefix . self::random($len), 0, 254);
            if (!\CartRule::getIdByCode($code)) {
                break;
            }
        }

        $rule = new \CartRule();
        $rule->code = $code;
        $rule->date_from = date('Y-m-d H:i:s', time() - 60);
        $rule->date_to = date('Y-m-d H:i:s', time() + $days * 86400);
        $rule->quantity = 1;
        $rule->quantity_per_user = 1;
        $rule->highlight = 0;
        $rule->partial_use = 0;
        $rule->active = 1;
        $rule->minimum_amount = $min;
        $rule->minimum_amount_tax = 1;
        $rule->minimum_amount_currency = (int) \Configuration::get('PS_CURRENCY_DEFAULT');
        $rule->minimum_amount_shipping = 0;
        $rule->description = \Tools::substr('Popup Studio: ' . (string) $popupName . ($email !== '' ? ' · ' . $email : ''), 0, 250);
        if ($idCustomer) {
            $rule->id_customer = (int) $idCustomer;
        }
        if ($type === 'shipping') {
            $rule->free_shipping = 1;
        } elseif ($type === 'amount') {
            $rule->reduction_amount = $value;
            $rule->reduction_tax = 1;
            $rule->reduction_currency = (int) \Configuration::get('PS_CURRENCY_DEFAULT');
        } else {
            $rule->reduction_percent = min(100, $value);
        }
        // Customers see this name in the cart, so it describes the discount, not the popup.
        $module = \Module::getInstanceByName('popupstudio');
        $t = $module ? $module->getTranslator() : null;
        $amount = $value;
        if ($type === 'amount') {
            try {
                $cur = new \Currency((int) \Configuration::get('PS_CURRENCY_DEFAULT'));
                $amount = \Context::getContext()->getCurrentLocale()->formatPrice($value, $cur->iso_code);
            } catch (\Exception $e) {
                $amount = $value;
            }
        }
        $pct = rtrim(rtrim(number_format($value, 2, '.', ''), '0'), '.');
        foreach (\Language::getLanguages(false) as $lang) {
            $loc = !empty($lang['locale']) ? (string) $lang['locale'] : '';
            if ($type === 'shipping') {
                $label = self::tr('Free shipping', [], $loc, $t);
            } elseif ($type === 'amount') {
                $label = self::tr('%amount% off', ['%amount%' => $amount], $loc, $t);
            } else {
                $label = self::tr('%percent%% off', ['%percent%' => $pct], $loc, $t);
            }
            $rule->name[(int) $lang['id_lang']] = \Tools::substr($label, 0, 254);
        }
        if (!$rule->add()) {
            return ['code' => '', 'id_cart_rule' => 0, 'expires' => ''];
        }

        return ['code' => $code, 'id_cart_rule' => (int) $rule->id, 'expires' => $rule->date_to];
    }

    /**
     * Shop-domain wording in a given locale. The current language goes through PrestaShop's translator
     * (so edits made in International > Translations apply); other languages read the module's XLIFF file,
     * because PrestaShop only loads module catalogues for the language of the current request.
     */
    private static function tr($source, array $params, $locale, $translator = null)
    {
        static $files = [];
        $current = (string) \Context::getContext()->language->locale;
        $text = $source;
        if ($translator && ($locale === '' || $locale === $current)) {
            return $translator->trans($source, $params, 'Modules.Popupstudio.Shop');
        }
        if ($locale !== '') {
            if (!isset($files[$locale])) {
                $files[$locale] = [];
                $f = _PS_MODULE_DIR_ . 'popupstudio/translations/' . $locale . '/ModulesPopupstudioShop.' . $locale . '.xlf';
                if (is_file($f) && ($xml = @simplexml_load_file($f))) {
                    $xml->registerXPathNamespace('x', 'urn:oasis:names:tc:xliff:document:1.2');
                    foreach ($xml->xpath('//x:trans-unit') ?: [] as $u) {
                        $files[$locale][(string) $u->source] = (string) $u->target;
                    }
                }
            }
            if (!empty($files[$locale][$source])) {
                $text = $files[$locale][$source];
            }
        }

        return strtr($text, $params);
    }

    public static function applyToCart($code)
    {
        $ctx = \Context::getContext();
        $id = (int) \CartRule::getIdByCode($code);
        if (!$id) {
            return false;
        }
        if (!$ctx->cart || !$ctx->cart->id) {
            $ctx->cookie->psx_apply = $code;

            return true;
        }
        $rule = new \CartRule($id);
        // With $display_error = false, checkValidity() returns true when the rule can be used.
        if (!$rule->checkValidity($ctx, false, false)) {
            return false;
        }

        return (bool) $ctx->cart->addCartRule($id);
    }

    /**
     * A code applied before the visitor had a cart waits in the cookie; apply it once a cart exists.
     */
    public static function applyPending()
    {
        $ctx = \Context::getContext();
        if (empty($ctx->cookie->psx_apply) || !$ctx->cart || !$ctx->cart->id || !$ctx->cart->nbProducts()) {
            return;
        }
        $code = (string) $ctx->cookie->psx_apply;
        unset($ctx->cookie->psx_apply);
        $id = (int) \CartRule::getIdByCode($code);
        if ($id && !in_array($id, array_column($ctx->cart->getCartRules(), 'id_cart_rule'))) {
            self::applyToCart($code);
        }
    }

    /**
     * Unused generated codes that have expired are removed so Cart rules stays readable.
     */
    public static function cleanup()
    {
        if (!\Configuration::get('POPUPSTUDIO_COUPON_CLEANUP')) {
            return 0;
        }
        $ids = \Db::getInstance()->executeS('SELECT l.id_cart_rule FROM `' . _DB_PREFIX_ . 'popupstudio_lead` l
            INNER JOIN `' . _DB_PREFIX_ . 'cart_rule` c ON c.id_cart_rule = l.id_cart_rule
            WHERE l.id_cart_rule > 0 AND l.coupon_used = 0 AND c.date_to < NOW() AND c.quantity > 0 LIMIT 200') ?: [];
        $n = 0;
        foreach ($ids as $r) {
            $rule = new \CartRule((int) $r['id_cart_rule']);
            if ($rule->id && $rule->delete()) {
                ++$n;
            }
        }

        return $n;
    }

    private static function random($len)
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $out = '';
        $max = strlen($chars) - 1;
        for ($i = 0; $i < $len; ++$i) {
            $out .= $chars[random_int(0, $max)];
        }

        return $out;
    }
}
