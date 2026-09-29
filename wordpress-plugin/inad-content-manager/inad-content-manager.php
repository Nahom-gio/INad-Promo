<?php
/**
 * Plugin Name: INAD Content Manager
 * Description: Manages the INAD website project gallery, client logos, About video, and public content API.
 * Version: 1.3.0
 * Author: INAD Promotion
 * Requires at least: 6.4
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

final class INAD_Content_Manager {
    const VERSION = '1.3.0';
    const ABOUT_VIDEO_OPTION = 'inad_about_video_id';

    public static function init() {
        add_action('init', array(__CLASS__, 'register_content_types'));
        add_action('admin_menu', array(__CLASS__, 'register_admin_menu'));
        add_action('add_meta_boxes', array(__CLASS__, 'register_meta_boxes'));
        add_action('save_post_inad_project', array(__CLASS__, 'save_project'));
        add_action('save_post_inad_client_logo', array(__CLASS__, 'save_client_logo'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_admin_assets'));
        add_action('rest_api_init', array(__CLASS__, 'register_api'));
        add_action('after_setup_theme', array(__CLASS__, 'enable_thumbnails'));
    }

    public static function enable_thumbnails() {
        add_theme_support('post-thumbnails');
    }

    public static function register_admin_menu() {
        add_menu_page(
            'INAD Content',
            'INAD Content',
            'edit_posts',
            'inad-content',
            array(__CLASS__, 'render_overview_page'),
            'dashicons-layout',
            25
        );
        add_submenu_page(
            'inad-content',
            'About Video',
            'About Video',
            'upload_files',
            'inad-about-video',
            array(__CLASS__, 'render_about_page')
        );
    }

    public static function register_content_types() {
        register_post_type('inad_project', array(
            'labels' => array(
                'name' => 'Projects',
                'singular_name' => 'Project Brand',
                'add_new_item' => 'Add Project Brand',
                'edit_item' => 'Edit Project Brand',
                'featured_image' => 'Cover Image',
                'set_featured_image' => 'Set cover image',
                'remove_featured_image' => 'Remove cover image',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'inad-content',
            'supports' => array('title', 'thumbnail'),
            'menu_icon' => 'dashicons-format-gallery',
        ));

        register_post_type('inad_client_logo', array(
            'labels' => array(
                'name' => 'Client Logos',
                'singular_name' => 'Client Logo',
                'add_new_item' => 'Add Client Logo',
                'edit_item' => 'Edit Client Logo',
                'featured_image' => 'Logo Image',
                'set_featured_image' => 'Set logo image',
                'remove_featured_image' => 'Remove logo image',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'inad-content',
            'supports' => array('title', 'thumbnail'),
            'menu_icon' => 'dashicons-images-alt2',
        ));
    }

    public static function render_overview_page() {
        if (!current_user_can('edit_posts')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1>INAD Website Content</h1>
            <p>Use these sections to update the content shown on the public INAD website.</p>
            <ul class="ul-disc">
                <li><a href="<?php echo esc_url(admin_url('edit.php?post_type=inad_project')); ?>">Projects</a>: brand folders, categories, cover images, and gallery images.</li>
                <li><a href="<?php echo esc_url(admin_url('edit.php?post_type=inad_client_logo')); ?>">Client Logos</a>: logos shown in the client marquee.</li>
                <li><a href="<?php echo esc_url(admin_url('admin.php?page=inad-about-video')); ?>">About Video</a>: video shown in the About section.</li>
            </ul>
            <p>Published changes are delivered through the read-only endpoint at <code><?php echo esc_html(rest_url('inad/v1/content')); ?></code>.</p>
        </div>
        <?php
    }

    public static function register_meta_boxes() {
        add_meta_box(
            'inad_project_details',
            'Project Details',
            array(__CLASS__, 'render_project_meta_box'),
            'inad_project',
            'normal',
            'high'
        );
        add_meta_box(
            'inad_logo_details',
            'Logo Details',
            array(__CLASS__, 'render_logo_meta_box'),
            'inad_client_logo',
            'normal',
            'default'
        );
    }

    private static function meta($post_id, $key, $default = '') {
        $value = get_post_meta($post_id, $key, true);
        return '' === $value ? $default : $value;
    }

    public static function render_project_meta_box($post) {
        wp_nonce_field('inad_save_project', 'inad_project_nonce');
        $category = self::meta($post->ID, '_inad_category', 'btl');
        $gallery_ids = self::meta($post->ID, '_inad_gallery_ids');
        ?>
        <style>
            .inad-fields{display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:16px;max-width:900px}.inad-field label{display:block;font-weight:600;margin-bottom:5px}.inad-field input:not([type="checkbox"]),.inad-field select{width:100%}.inad-field input[type="checkbox"]{width:auto}.inad-wide{grid-column:1/-1}.inad-gallery-preview{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.inad-gallery-preview img{width:90px;height:70px;object-fit:cover;border:1px solid #ccd0d4;border-radius:3px}@media(max-width:782px){.inad-fields{grid-template-columns:1fr}}
        </style>
        <div class="inad-fields">
            <div class="inad-field">
                <label for="inad_category">Category</label>
                <select id="inad_category" name="inad_category">
                    <?php
                    $categories = array(
                        'btl' => 'BTL Marketing',
                        'events' => 'Corporate Events',
                        'branding' => 'Corporate Branding',
                        'print' => 'Printing',
                        'publication' => 'Publication',
                        'product-launch-event' => 'Product Launch Event',
                    );
                    foreach ($categories as $value => $label) {
                        printf('<option value="%s" %s>%s</option>', esc_attr($value), selected($category, $value, false), esc_html($label));
                    }
                    ?>
                </select>
            </div>
            <div class="inad-field">
                <label for="inad_brand_slug">Brand slug</label>
                <input id="inad_brand_slug" name="inad_brand_slug" value="<?php echo esc_attr(self::meta($post->ID, '_inad_brand_slug')); ?>" placeholder="example-brand">
                <p class="description">Letters, numbers, and hyphens. Generated from the title if empty.</p>
            </div>
            <div class="inad-field">
                <label for="inad_folder_label">Folder label</label>
                <input id="inad_folder_label" name="inad_folder_label" value="<?php echo esc_attr(self::meta($post->ID, '_inad_folder_label')); ?>" placeholder="Defaults to the project title">
            </div>
            <div class="inad-field">
                <label for="inad_brand_label">Brand label</label>
                <input id="inad_brand_label" name="inad_brand_label" value="<?php echo esc_attr(self::meta($post->ID, '_inad_brand_label')); ?>" placeholder="Defaults to the folder label">
            </div>
            <div class="inad-field">
                <label for="inad_campaign_title">Campaign title</label>
                <input id="inad_campaign_title" name="inad_campaign_title" value="<?php echo esc_attr(self::meta($post->ID, '_inad_campaign_title')); ?>" placeholder="Defaults to the project title">
            </div>
            <div class="inad-field">
                <label for="inad_order">Display order</label>
                <input id="inad_order" name="inad_order" type="number" step="1" value="<?php echo esc_attr(self::meta($post->ID, '_inad_order', 0)); ?>">
            </div>
            <div class="inad-field inad-wide">
                <label><input name="inad_show_in_all" type="checkbox" value="1" <?php checked(self::meta($post->ID, '_inad_show_in_all'), '1'); ?>> Show the first image in the “All Work” view</label>
            </div>
            <div class="inad-field inad-wide">
                <label>Gallery images</label>
                <input type="hidden" id="inad_gallery_ids" name="inad_gallery_ids" value="<?php echo esc_attr($gallery_ids); ?>">
                <div class="inad-gallery-preview" data-inad-gallery-preview>
                    <?php
                    foreach (self::id_list($gallery_ids) as $attachment_id) {
                        echo wp_get_attachment_image($attachment_id, 'thumbnail');
                    }
                    ?>
                </div>
                <button type="button" class="button" data-inad-select-gallery>Select gallery images</button>
                <button type="button" class="button" data-inad-clear-gallery>Clear gallery</button>
                <p class="description">Use the Cover Image panel for the folder cover. Gallery image titles and alternative text are taken from the Media Library.</p>
            </div>
        </div>
        <?php
    }

    public static function render_logo_meta_box($post) {
        wp_nonce_field('inad_save_logo', 'inad_logo_nonce');
        ?>
        <p>
            <label for="inad_logo_alt"><strong>Alternative text</strong></label><br>
            <input id="inad_logo_alt" name="inad_logo_alt" class="widefat" value="<?php echo esc_attr(self::meta($post->ID, '_inad_logo_alt')); ?>" placeholder="Client company name">
        </p>
        <p>
            <label for="inad_logo_order"><strong>Display order</strong></label><br>
            <input id="inad_logo_order" name="inad_logo_order" type="number" step="1" value="<?php echo esc_attr(self::meta($post->ID, '_inad_order', 0)); ?>">
        </p>
        <p class="description">Set the actual logo using the Logo Image panel.</p>
        <?php
    }

    private static function can_save($post_id, $nonce_name, $nonce_action) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }
        if (!isset($_POST[$nonce_name]) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST[$nonce_name])), $nonce_action)) {
            return false;
        }
        return current_user_can('edit_post', $post_id);
    }

    public static function save_project($post_id) {
        if (!self::can_save($post_id, 'inad_project_nonce', 'inad_save_project')) {
            return;
        }

        $allowed_categories = array('btl', 'events', 'branding', 'print', 'publication', 'product-launch-event');
        $category = isset($_POST['inad_category']) ? sanitize_key(wp_unslash($_POST['inad_category'])) : 'btl';
        if (!in_array($category, $allowed_categories, true)) {
            $category = 'btl';
        }
        update_post_meta($post_id, '_inad_category', $category);

        $text_fields = array(
            'inad_brand_slug' => '_inad_brand_slug',
            'inad_folder_label' => '_inad_folder_label',
            'inad_brand_label' => '_inad_brand_label',
            'inad_campaign_title' => '_inad_campaign_title',
        );
        foreach ($text_fields as $field => $meta_key) {
            $value = isset($_POST[$field]) ? sanitize_text_field(wp_unslash($_POST[$field])) : '';
            update_post_meta($post_id, $meta_key, 'inad_brand_slug' === $field ? sanitize_title($value) : $value);
        }

        $order = isset($_POST['inad_order']) ? intval($_POST['inad_order']) : 0;
        update_post_meta($post_id, '_inad_order', $order);
        update_post_meta($post_id, '_inad_show_in_all', isset($_POST['inad_show_in_all']) ? '1' : '0');

        $gallery = isset($_POST['inad_gallery_ids']) ? self::id_list(wp_unslash($_POST['inad_gallery_ids'])) : array();
        update_post_meta($post_id, '_inad_gallery_ids', implode(',', $gallery));
    }

    public static function save_client_logo($post_id) {
        if (!self::can_save($post_id, 'inad_logo_nonce', 'inad_save_logo')) {
            return;
        }
        $alt = isset($_POST['inad_logo_alt']) ? sanitize_text_field(wp_unslash($_POST['inad_logo_alt'])) : '';
        $order = isset($_POST['inad_logo_order']) ? intval($_POST['inad_logo_order']) : 0;
        update_post_meta($post_id, '_inad_logo_alt', $alt);
        update_post_meta($post_id, '_inad_order', $order);
    }

    public static function enqueue_admin_assets($hook) {
        $screen = get_current_screen();
        $is_content_post = $screen && in_array($screen->post_type, array('inad_project', 'inad_client_logo'), true);
        $is_about_page = 'inad-content_page_inad-about-video' === $hook;
        if (!$is_content_post && !$is_about_page) {
            return;
        }
        wp_enqueue_media();
        wp_enqueue_script(
            'inad-content-admin',
            plugin_dir_url(__FILE__) . 'assets/admin.js',
            array('jquery'),
            self::VERSION,
            true
        );
    }

    public static function render_about_page() {
        if (!current_user_can('upload_files')) {
            return;
        }
        if (isset($_POST['inad_save_about'])) {
            check_admin_referer('inad_save_about_video');
            $video_id = isset($_POST['inad_about_video_id']) ? absint($_POST['inad_about_video_id']) : 0;
            update_option(self::ABOUT_VIDEO_OPTION, $video_id, false);
            echo '<div class="notice notice-success is-dismissible"><p>About video saved.</p></div>';
        }
        $video_id = absint(get_option(self::ABOUT_VIDEO_OPTION, 0));
        $video_url = $video_id ? wp_get_attachment_url($video_id) : '';
        ?>
        <div class="wrap">
            <h1>About Video</h1>
            <p>Select the video displayed in the homepage About section.</p>
            <form method="post">
                <?php wp_nonce_field('inad_save_about_video'); ?>
                <input type="hidden" id="inad_about_video_id" name="inad_about_video_id" value="<?php echo esc_attr($video_id); ?>">
                <p data-inad-video-name><?php echo $video_url ? esc_html(wp_basename($video_url)) : 'No video selected.'; ?></p>
                <p>
                    <button type="button" class="button" data-inad-select-video>Select video</button>
                    <button type="button" class="button" data-inad-clear-video>Clear</button>
                </p>
                <?php submit_button('Save About Video', 'primary', 'inad_save_about'); ?>
            </form>
        </div>
        <?php
    }

    private static function id_list($value) {
        if (is_array($value)) {
            $ids = $value;
        } else {
            $ids = preg_split('/\s*,\s*/', (string) $value, -1, PREG_SPLIT_NO_EMPTY);
        }
        return array_values(array_filter(array_map('absint', $ids)));
    }

    private static function image_data($attachment_id) {
        $attachment_id = absint($attachment_id);
        if (!$attachment_id) {
            return null;
        }
        $image = wp_get_attachment_image_src($attachment_id, 'full');
        if (!$image) {
            return null;
        }
        return array(
            'url' => esc_url_raw($image[0]),
            'width' => (int) $image[1],
            'height' => (int) $image[2],
        );
    }

    private static function attachment_item($attachment_id, $campaign_title) {
        $image = self::image_data($attachment_id);
        if (!$image) {
            return null;
        }
        return array(
            'title' => $campaign_title,
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            'image' => $image,
        );
    }

    public static function register_api() {
        register_rest_route('inad/v1', '/content', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array(__CLASS__, 'get_public_content'),
            'permission_callback' => '__return_true',
        ));
    }

    public static function get_public_content() {
        $projects = get_posts(array(
            'post_type' => 'inad_project',
            'post_status' => 'publish',
            'numberposts' => -1,
        ));
        usort($projects, array(__CLASS__, 'sort_by_order'));

        $project_data = array();
        foreach ($projects as $project) {
            $title = get_the_title($project);
            $campaign_title = self::meta($project->ID, '_inad_campaign_title', $title);
            $items = array();
            foreach (self::id_list(self::meta($project->ID, '_inad_gallery_ids')) as $attachment_id) {
                $item = self::attachment_item($attachment_id, $campaign_title);
                if ($item) {
                    $items[] = $item;
                }
            }
            $project_data[] = array(
                'name' => $title,
                'slug' => self::meta($project->ID, '_inad_brand_slug', sanitize_title($title)),
                'category' => self::meta($project->ID, '_inad_category', 'btl'),
                'folderLabel' => self::meta($project->ID, '_inad_folder_label', $title),
                'brandLabel' => self::meta($project->ID, '_inad_brand_label', $title),
                'campaignTitle' => $campaign_title,
                'order' => (int) self::meta($project->ID, '_inad_order', 0),
                'showInAll' => '1' === self::meta($project->ID, '_inad_show_in_all'),
                'coverImage' => self::image_data(get_post_thumbnail_id($project)),
                'items' => $items,
            );
        }

        $logos = get_posts(array(
            'post_type' => 'inad_client_logo',
            'post_status' => 'publish',
            'numberposts' => -1,
        ));
        usort($logos, array(__CLASS__, 'sort_by_order'));

        $logo_data = array();
        foreach ($logos as $logo) {
            $image = self::image_data(get_post_thumbnail_id($logo));
            if (!$image) {
                continue;
            }
            $logo_data[] = array(
                'name' => get_the_title($logo),
                'alt' => self::meta($logo->ID, '_inad_logo_alt', get_the_title($logo)),
                'order' => (int) self::meta($logo->ID, '_inad_order', 0),
                'logo' => $image,
            );
        }

        $video_id = absint(get_option(self::ABOUT_VIDEO_OPTION, 0));
        $video_url = $video_id ? wp_get_attachment_url($video_id) : '';
        $response = array(
            'about' => array('video' => $video_url ? array('url' => esc_url_raw($video_url)) : null),
            'projectBrands' => $project_data,
            'clientLogos' => $logo_data,
        );

        return rest_ensure_response($response);
    }

    public static function sort_by_order($a, $b) {
        $a_order = (int) self::meta($a->ID, '_inad_order', 0);
        $b_order = (int) self::meta($b->ID, '_inad_order', 0);
        if ($a_order === $b_order) {
            return strcasecmp($a->post_title, $b->post_title);
        }
        return $a_order <=> $b_order;
    }
}

INAD_Content_Manager::init();
