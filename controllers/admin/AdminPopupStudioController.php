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

use Iamshoaibktk\Popupstudio\Admin;
use Iamshoaibktk\Popupstudio\Coupons;
use Iamshoaibktk\Popupstudio\Front;
use Iamshoaibktk\Popupstudio\Gdpr;
use Iamshoaibktk\Popupstudio\Installer;
use Iamshoaibktk\Popupstudio\Repository;
use Iamshoaibktk\Popupstudio\Stats;
use Iamshoaibktk\Popupstudio\Templates;
use Iamshoaibktk\Popupstudio\Webhook;

/**
 * Back office: one page app (views/js/admin.js) plus a JSON API on the same controller.
 */
class AdminPopupStudioController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true;
        parent::__construct();
    }

    public function initContent()
    {
        if (Tools::getValue('psxapi')) {
            $this->api();
        }
        if (Tools::getValue('export') === 'leads') {
            $this->exportLeads();
        }
        parent::initContent();
        $this->context->smarty->assign([
            'psx_boot' => json_encode(Admin::boot($this->module, $this->context, $this->context->link->getAdminLink('AdminPopupStudio')), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP),
            'author_img' => $this->module->getPathUri() . 'views/img/author.jpg',
        ]);
        $this->content = $this->context->smarty->fetch(_PS_MODULE_DIR_ . $this->module->name . '/views/templates/admin/app.tpl');
        $this->context->smarty->assign('content', $this->content);
    }

    public function setMedia($isNewTheme = false)
    {
        parent::setMedia($isNewTheme);
        $base = $this->module->getPathUri();
        $dir = _PS_MODULE_DIR_ . $this->module->name . '/';
        $v = $this->module->version . '-' . max(filemtime($dir . 'views/js/admin.js'), filemtime($dir . 'views/js/editor.js'), filemtime($dir . 'views/js/render.js'), filemtime($dir . 'views/css/admin.css'), filemtime($dir . 'views/css/front.css'));
        $this->addCSS($base . 'views/css/front.css?v=' . $v, 'all');
        $this->addCSS($base . 'views/css/admin.css?v=' . $v, 'all');
        $this->addJS($base . 'views/js/render.js?v=' . $v);
        $this->addJS($base . 'views/js/admin.js?v=' . $v);
        $this->addJS($base . 'views/js/editor.js?v=' . $v);
    }

    private function json($data, $code = 200)
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private function body()
    {
        $raw = (string) Tools::file_get_contents('php://input');
        $d = json_decode($raw, true);

        return is_array($d) ? $d : [];
    }

    private function api()
    {
        if (!$this->access('view')) {
            $this->json(['ok' => false, 'error' => 'access'], 403);
        }
        $repo = new Repository();
        $b = $this->body();
        $do = (string) Tools::getValue('psxapi');
        $write = ['save', 'delete', 'duplicate', 'status', 'reorder', 'settings_save', 'lead_delete', 'import', 'webhook_test', 'cleanup', 'stats_reset'];
        if (in_array($do, $write, true) && !$this->access('edit')) {
            $this->json(['ok' => false, 'error' => 'access'], 403);
        }
        switch ($do) {
            case 'list':
                $this->json(['ok' => true, 'popups' => Admin::listRows($repo), 'kpi' => Stats::report(30)]);
                // no break
            case 'get':
                $this->json(['ok' => true, 'popup' => $repo->getPopup((int) Tools::getValue('id'))]);
                // no break
            case 'save':
                $id = $repo->save($b);
                if (!$id) {
                    $this->json(['ok' => false, 'error' => 'save']);
                }
                $this->json(['ok' => true, 'id' => $id, 'popup' => $repo->getPopup($id)]);
                // no break
            case 'delete':
                $repo->delete((int) (isset($b['id']) ? $b['id'] : 0));
                $this->json(['ok' => true]);
                // no break
            case 'duplicate':
                $this->json(['ok' => true, 'id' => $repo->duplicate((int) (isset($b['id']) ? $b['id'] : 0))]);
                // no break
            case 'status':
                $this->json(['ok' => (bool) $repo->setStatus((int) $b['id'], (string) $b['status'])]);
                // no break
            case 'reorder':
                $this->json(['ok' => $repo->reorder(isset($b['ids']) ? (array) $b['ids'] : [])]);
                // no break
            case 'templates':
                $this->json(['ok' => true, 'templates' => Templates::all($this->module)]);
                // no break
            case 'template':
                $this->json(['ok' => true, 'template' => Templates::get($this->module, (string) Tools::getValue('slug'))]);
                // no break
            case 'stats':
                $this->json(['ok' => true, 'report' => Stats::report((int) Tools::getValue('days', 30), (int) Tools::getValue('id'))]);
                // no break
            case 'variants':
                $this->json(['ok' => true, 'ab' => Stats::variants((int) Tools::getValue('id'), (string) Tools::getValue('goal', 'signups'))]);
                // no break
            case 'leads':
                $this->json(['ok' => true] + Admin::leads((int) Tools::getValue('page', 1), (string) Tools::getValue('q'), (int) Tools::getValue('id'), (string) Tools::getValue('coupon')));
                // no break
            case 'feedback_delete':
                $this->json(['ok' => (bool) Db::getInstance()->delete('popupstudio_feedback', 'id_feedback = ' . (int) (isset($b['id']) ? $b['id'] : 0))]);
                // no break
            case 'lead_delete':
                $this->json(['ok' => (bool) Gdpr::delete((string) (isset($b['email']) ? $b['email'] : ''))]);
                // no break
            case 'settings_save':
                Admin::saveSettings($b);
                $this->json(['ok' => true, 'settings' => Admin::settings($this->module)]);
                // no break
            case 'webhook_test':
                $res = Webhook::send(['id' => 0, 'name' => 'Test'], ['email' => 'test@example.com', 'firstname' => 'Test', 'consent' => 1], ['code' => 'TEST-CODE'], isset($b['url']) ? (string) $b['url'] : null);
                $this->json(['ok' => (bool) $res, 'result' => $res]);
                // no break
            case 'cleanup':
                $this->json(['ok' => true, 'deleted' => Coupons::cleanup()]);
                // no break
            case 'search':
                $this->json(['ok' => true, 'items' => Admin::search((string) Tools::getValue('kind'), (string) Tools::getValue('q'), $this->context)]);
                // no break
            case 'preview':
                $this->json(['ok' => true, 'url' => Admin::previewUrl((int) Tools::getValue('id'), (int) Tools::getValue('debug'), (int) Tools::getValue('v'), $this->context)]);
                // no break
            case 'export':
                $ids = array_filter(array_map('intval', explode(',', (string) Tools::getValue('ids'))));
                $this->json(['ok' => true, 'file' => Admin::export($repo, $ids)]);
                // no break
            case 'import':
                $this->json(['ok' => true, 'ids' => Admin::import($repo, $b)]);
                // no break
            case 'stats_reset':
                Db::getInstance()->delete('popupstudio_stat', 'id_popup = ' . (int) (isset($b['id']) ? $b['id'] : 0));
                $this->json(['ok' => true]);
        }
        $this->json(['ok' => false, 'error' => 'unknown'], 400);
    }

    private function exportLeads()
    {
        if (!$this->access('view')) {
            die('Access denied');
        }
        Admin::leadsCsv((int) Tools::getValue('id'));
        exit;
    }
}
