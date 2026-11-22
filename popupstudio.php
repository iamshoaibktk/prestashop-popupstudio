<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk@gmail.com (WhatsApp: +923459016286)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

spl_autoload_register(function ($class) {
    $prefix = 'Iamshoaibktk\\Popupstudio\\';
    if (strpos($class, $prefix) !== 0) {
        return;
    }
    $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});

use Iamshoaibktk\Popupstudio\Coupons;
use Iamshoaibktk\Popupstudio\Front;
use Iamshoaibktk\Popupstudio\Gdpr;
use Iamshoaibktk\Popupstudio\Installer;
use Iamshoaibktk\Popupstudio\Repository;
use Iamshoaibktk\Popupstudio\Stats;
use PrestaShop\PrestaShop\Core\Module\WidgetInterface;

class Popupstudio extends Module implements WidgetInterface
{
    public function __construct()
    {
        $this->name = 'popupstudio';
        $this->tab = 'front_office_features';
        $this->version = '1.0.1';
        $this->author = 'iamshoaibktk@gmail.com';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '8.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->trans('Popup Studio', [], 'Modules.Popupstudio.Admin');
        $this->description = $this->trans('Popups, bars, slide-ins and games with targeting, A/B tests, coupons and stats. 50 templates.', [], 'Modules.Popupstudio.Admin');
        $this->confirmUninstall = $this->trans('Are you sure you want to uninstall this module?', [], 'Modules.Popupstudio.Admin');
    }

    public function isUsingNewTranslationSystem()
    {
        return true;
    }

    public function install()
    {
        return parent::install()
            && Installer::install($this)
            && $this->registerHook(Installer::HOOKS);
    }

    public function uninstall()
    {
        return Installer::uninstall($this) && parent::uninstall();
    }

    public function getContent()
    {
        Tools::redirectAdmin($this->context->link->getAdminLink('AdminPopupStudio'));

        return '';
    }

    /* ---------------- Storefront ---------------- */

    public function hookActionFrontControllerSetMedia()
    {
        Coupons::applyPending();
        Front::setMedia($this);
    }

    public function hookDisplayBeforeBodyClosingTag()
    {
        return Front::output($this);
    }

    public function renderWidget($hookName, array $configuration)
    {
        $id = isset($configuration['id']) ? (int) $configuration['id'] : 0;

        return Front::inline($this, $id, (string) $hookName);
    }

    public function getWidgetVariables($hookName, array $configuration)
    {
        return ['id' => isset($configuration['id']) ? (int) $configuration['id'] : 0];
    }

    public function hookDisplayPopupStudio($params)
    {
        $id = isset($params['id']) ? (int) $params['id'] : 0;

        return Front::inline($this, $id, 'displayPopupStudio');
    }

    /* ---------------- Orders and attribution ---------------- */

    public function hookActionValidateOrder($params)
    {
        if (!empty($params['order']) && !empty($params['cart'])) {
            Stats::creditOrder($params['order'], $params['cart']);
        }
    }

    /* ---------------- GDPR (Official GDPR module) ---------------- */

    public function hookRegisterGDPRConsent($params)
    {
        // Registering this hook lists Popup Studio in the GDPR module's consent settings.
    }

    public function hookActionDeleteGDPRCustomer($customer)
    {
        if (!empty($customer['email']) && Validate::isEmail($customer['email'])) {
            Gdpr::delete((string) $customer['email']);
        }

        return json_encode(true);
    }

    public function hookActionExportGDPRData($customer)
    {
        if (empty($customer['email']) || !Validate::isEmail($customer['email'])) {
            return json_encode([]);
        }

        return json_encode(Gdpr::export((string) $customer['email']));
    }

    /* ---------------- Helpers ---------------- */

    public function t($text, $params = [])
    {
        return $this->trans($text, $params, 'Modules.Popupstudio.Admin');
    }

    public function repository()
    {
        return new Repository();
    }
}
