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
 * Signs visitors up through the shop's own newsletter module (ps_emailsubscription),
 * so its double opt-in, voucher and confirmation emails keep working as configured.
 */
class Newsletter
{
    public static function module()
    {
        if (!\Module::isEnabled('ps_emailsubscription')) {
            return null;
        }
        $m = \Module::getInstanceByName('ps_emailsubscription');

        return $m && method_exists($m, 'newsletterRegistration') ? $m : null;
    }

    public static function isRegistered($email, $idShop)
    {
        if (!\Validate::isEmail($email)) {
            return false;
        }
        $db = \Db::getInstance();
        if ((int) $db->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'customer` WHERE email = "' . pSQL($email) . '" AND newsletter = 1 AND id_shop = ' . (int) $idShop)) {
            return true;
        }
        $table = _DB_PREFIX_ . 'emailsubscription';
        if (!$db->executeS('SHOW TABLES LIKE "' . pSQL($table) . '"')) {
            return false;
        }

        return (bool) $db->getValue('SELECT COUNT(*) FROM `' . $table . '` WHERE email = "' . pSQL($email) . '" AND active = 1 AND id_shop = ' . (int) $idShop);
    }

    /**
     * @return string subscribed | pending | exists | unavailable | error
     */
    public static function subscribe($email)
    {
        $ctx = \Context::getContext();
        if (self::isRegistered($email, (int) $ctx->shop->id)) {
            return 'exists';
        }
        $m = self::module();
        if (!$m) {
            return 'unavailable';
        }
        $backup = $_POST;
        $_POST['email'] = $email;
        $_POST['action'] = '0';
        try {
            $m->newsletterRegistration();
        } catch (\Exception $e) {
            $_POST = $backup;

            return 'error';
        }
        $_POST = $backup;
        if (self::isRegistered($email, (int) $ctx->shop->id)) {
            return 'subscribed';
        }

        return \Configuration::get('NW_VERIFICATION_EMAIL') ? 'pending' : 'error';
    }
}
