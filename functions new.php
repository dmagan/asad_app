<?php
// فعال‌سازی کد خرید و خریدار برای قالب Flatsome
update_option('flatsome_wup_purchase_code', 'قالب توسط ایران فلتسام به صورت کامل فعال شده است.');
update_option('flatsome_wup_buyer', 'ایران فلتسام');

/**
 * Flatsome functions and definitions
 *
 * @package flatsome
 */
require get_template_directory() . '/inc/init.php';
flatsome()->init();

// افزودن امکان بروزرسانی قالب از طریق JSON
require 'plugin-update-checker/plugin-update-checker.php';
$myUpdateChecker = Puc_v4_Factory::buildUpdateChecker(
    'http://dl.flatsomee.ir/sources/fl/fghyjuiujyhgfd5444.json',
    __FILE__, // مسیر کامل به فایل اصلی پلاگین یا functions.php
    'flatsome'
);



/*---------------------------------------------------------------
// فعال‌سازی دسترسی API و رفع محدودیت CORS
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit();
    }
});
---------------------------------------------------------------*/





// اجازه دسترسی به ساخت کاربر
function custom_allow_create_users($allowed, $request) {
    return true;
}
add_filter('rest_user_can_create_users', 'custom_allow_create_users', 10, 2);

// رفع محدودیت امنیتی موقت برای تست
add_filter('rest_authentication_errors', function($errors) {
    return null;
});

// اطمینان از دسترسی create_users
function modify_user_caps($caps, $cap) {
    if ($cap === 'create_users') {
        return array();
    }
    return $caps;
}
add_filter('map_meta_cap', 'modify_user_caps', 10, 2);

// ثبت post type برای اعلان‌ها
function create_slider_post_type() {
    register_post_type('slider',
        array(
            'labels' => array(
                'name' => 'اعلان‌ها',
                'singular_name' => 'اعلان',
                'add_new' => 'افزودن اعلان',
                'add_new_item' => 'افزودن اعلان جدید',
                'edit_item' => 'ویرایش اعلان'
            ),
            'public' => true,
            'has_archive' => false,
            'supports' => array('title', 'thumbnail'),
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-images-alt2'
        )
    );
}
add_action('init', 'create_slider_post_type');

// ثبت post type برای استوری‌ها
function create_story_highlights_post_type() {
    register_post_type('story_highlights',
        array(
            'labels' => array(
                'name' => 'استوری‌های برجسته',
                'singular_name' => 'استوری برجسته',
                'add_new' => 'افزودن استوری',
                'add_new_item' => 'افزودن استوری جدید',
                'edit_item' => 'ویرایش استوری',
                'all_items' => 'همه استوری‌ها'
            ),
            'public' => true,
            'has_archive' => false,
            'supports' => array('title', 'thumbnail', 'custom-fields'),
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-format-gallery'
        )
    );
}
add_action('init', 'create_story_highlights_post_type');

// اضافه کردن متا باکس‌ها برای استوری‌ها
function add_story_meta_boxes() {
    add_meta_box(
        'story_gallery',
        'گالری استوری',
        'story_gallery_callback',
        'story_highlights',
        'normal',
        'high'
    );

    add_meta_box(
        'story_link',
        'لینک استوری',
        'story_link_callback',
        'story_highlights',
        'normal',
        'high'
    );

    add_meta_box(
        'story_subtitle',
        'متن زیر استوری',
        'story_subtitle_callback',
        'story_highlights',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_story_meta_boxes');

// تابع نمایش متا باکس گالری
function story_gallery_callback($post) {
    wp_nonce_field('story_gallery_nonce', 'story_gallery_nonce');
    $gallery_images = get_post_meta($post->ID, 'story_gallery', true);
    ?>
    <div class="story-gallery-wrapper">
        <div id="story-gallery-container">
            <?php
            if (!empty($gallery_images)) {
                $images = explode(',', $gallery_images);
                foreach ($images as $image_id) {
                    $image = wp_get_attachment_image_src($image_id, 'thumbnail');
                    if ($image) {
                        echo '<div class="gallery-image-wrapper">';
                        echo '<img src="' . esc_url($image[0]) . '" data-id="' . esc_attr($image_id) . '">';
                        echo '<button type="button" class="remove-image">×</button>';
                        echo '</div>';
                    }
                }
            }
            ?>
        </div>
        <input type="hidden" id="story-gallery-ids" name="story_gallery" value="<?php echo esc_attr($gallery_images); ?>">
        <button type="button" class="button" id="add-gallery-images">افزودن تصاویر</button>
    </div>
    <script>
    jQuery(document).ready(function($) {
        var mediaUploader;
        $('#add-gallery-images').click(function(e) {
            e.preventDefault();
            if (mediaUploader) {
                mediaUploader.open();
                return;
            }
            mediaUploader = wp.media({
                title: 'انتخاب تصاویر',
                button: { text: 'افزودن به استوری' },
                multiple: true
            });
            mediaUploader.on('select', function() {
                var attachments = mediaUploader.state().get('selection').toJSON();
                var container = $('#story-gallery-container');
                var ids = $('#story-gallery-ids').val() ? $('#story-gallery-ids').val().split(',') : [];
                attachments.forEach(function(attachment) {
                    if (!ids.includes(attachment.id.toString())) {
                        ids.push(attachment.id);
                        container.append(`
                            <div class="gallery-image-wrapper">
                                <img src="${attachment.sizes.thumbnail.url}" data-id="${attachment.id}">
                                <button type="button" class="remove-image">×</button>
                            </div>
                        `);
                    }
                });
                $('#story-gallery-ids').val(ids.join(','));
            });
            mediaUploader.open();
        });
        $(document).on('click', '.remove-image', function() {
            var wrapper = $(this).parent();
            var imageId = wrapper.find('img').data('id').toString();
            var ids = $('#story-gallery-ids').val().split(',');
            ids = ids.filter(id => id !== imageId);
            $('#story-gallery-ids').val(ids.join(','));
            wrapper.remove();
        });
    });
    </script>
    <?php
}

// تابع نمایش متا باکس لینک
function story_link_callback($post) {
    $link = get_post_meta($post->ID, 'story_link', true);
    ?>
    <input type="text" name="story_link" value="<?php echo esc_attr($link); ?>" style="width: 100%">
    <?php
}

// تابع نمایش متا باکس توضیحات
function story_subtitle_callback($post) {
    $subtitle = get_post_meta($post->ID, 'story_subtitle', true);
    ?>
    <input type="text" name="story_subtitle" value="<?php echo esc_attr($subtitle); ?>" style="width: 100%">
    <?php
}

// ذخیره متا باکس‌ها
function save_story_meta($post_id) {
    if (!isset($_POST['story_gallery_nonce']) || !wp_verify_nonce($_POST['story_gallery_nonce'], 'story_gallery_nonce')) {
        return;
    }
    if (array_key_exists('story_gallery', $_POST)) {
        update_post_meta($post_id, 'story_gallery', sanitize_text_field($_POST['story_gallery']));
    }
    if (array_key_exists('story_link', $_POST)) {
        update_post_meta($post_id, 'story_link', sanitize_text_field($_POST['story_link']));
    }
    if (array_key_exists('story_subtitle', $_POST)) {
        update_post_meta($post_id, 'story_subtitle', sanitize_text_field($_POST['story_subtitle']));
    }
}
add_action('save_post', 'save_story_meta');

// اضافه کردن متا به REST API
function add_story_meta_to_rest() {
    register_rest_field('story_highlights', 'meta', array(
        'get_callback' => function($post) {
            $gallery_images = get_post_meta($post['id'], 'story_gallery', true);
            $gallery_urls = array();
            if (!empty($gallery_images)) {
                $images = explode(',', $gallery_images);
                foreach ($images as $image_id) {
                    $image = wp_get_attachment_image_src($image_id, 'full');
                    if ($image) {
                        $gallery_urls[] = $image[0];
                    }
                }
            }
            return array(
                'story_link' => get_post_meta($post['id'], 'story_link', true),
                'story_subtitle' => get_post_meta($post['id'], 'story_subtitle', true),
                'gallery_images' => $gallery_urls
            );
        }
    ));
}
add_action('rest_api_init', 'add_story_meta_to_rest');

// فعال‌سازی JWT Authentication
define('JWT_AUTH_SECRET_KEY', 'a7b8c9d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1');
define('JWT_AUTH_CORS_ENABLE', true);


/* --------------------------------------------------------
// // رفع محدودیت CORS برای JWT 
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return $value;
    });
}, 15);
-------------------------------------------------------- */

// فعال‌سازی WooCommerce REST API
add_filter('woocommerce_disable_rest_api', '__return_false');






















// اضافه کردن endpointهای مربوط به کاربر
add_action('rest_api_init', function() {
    // ثبت نام کاربر
    register_rest_route('wp/v2', '/register', array(
        'methods' => 'POST',
        'callback' => 'custom_user_registration',
        'permission_callback' => function() {
            return true;
        }
    ));

    // لاگین کاربر
    register_rest_route('wp/v2', '/login', array(
        'methods' => 'POST',
        'callback' => 'custom_user_login',
        'permission_callback' => function() {
            return true;
        }
    ));
});

function custom_user_registration($request) {
    $parameters = $request->get_params();
    
    // بررسی فیلدهای اجباری
    if (empty($parameters['username']) || 
    empty($parameters['email']) || 
    empty($parameters['password'])) {
    return new WP_Error(
        'missing_fields',
        'لطفاً تمام فیلدهای ضروری را پر کنید.',
        array('status' => 400)
    );
}
/*
    // بررسی تکراری نبودن شماره تلفن
    $existing_phone = get_users(array(
        'meta_key' => 'phone_number',
        'meta_value' => $parameters['phone_number'],
        'number' => 1
    ));

    if (!empty($existing_phone)) {
        return new WP_Error(
            'phone_exists',
            'این شماره تلفن قبلاً ثبت شده است.',
            array('status' => 400)
        );
    }
*/
    // ایجاد کاربر جدید
    $user_data = array(
        'user_login' => $parameters['username'],
        'user_pass' => $parameters['password'],
        'user_email' => $parameters['email'],
        'display_name' => isset($parameters['name']) ? $parameters['name'] : $parameters['username'],
        'role' => 'subscriber'
    );

    $user_id = wp_insert_user($user_data);

    if (is_wp_error($user_id)) {
        return new WP_Error(
            'registration_failed',
            $user_id->get_error_message(),
            array('status' => 400)
        );
    }

// ذخیره شماره تلفن
$phone = sanitize_text_field($parameters['phone_number']);
add_user_meta($user_id, 'phone_number', $phone, true);
update_user_meta($user_id, 'phone_number', $phone);
// ذخیره شماره در فیلد اصلی کاربر
wp_update_user(array(
    'ID' => $user_id,
    'user_url' => $phone // وردپرس از این فیلد برای نمایش شماره تلفن استفاده می‌کند
));

    // دریافت اطلاعات کاربر
    $user = get_user_by('id', $user_id);

    return array(
        'status' => 'success',
        'message' => 'ثبت نام با موفقیت انجام شد.',
        'data' => array(
            'user_id' => $user_id,
            'username' => $user->user_login,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'phone_number' => get_user_meta($user_id, 'phone_number', true)
        )
    );
}

function custom_user_login($request) {
    $parameters = $request->get_params();

    // بررسی فیلدهای اجباری
    if (empty($parameters['username']) || empty($parameters['password'])) {
        return new WP_Error(
            'missing_fields',
            'نام کاربری و رمز عبور را وارد کنید.',
            array('status' => 400)
        );
    }

    // احراز هویت کاربر
    $user = wp_authenticate($parameters['username'], $parameters['password']);

    if (is_wp_error($user)) {
        return new WP_Error(
            'login_failed',
            'نام کاربری یا رمز عبور اشتباه است.',
            array('status' => 401)
        );
    }

    // دریافت توکن JWT
    $token = array(
        'token' => wp_generate_password(32, false),
        'user_id' => $user->ID
    );

    update_user_meta($user->ID, 'auth_token', $token['token']);

    return array(
        'status' => 'success',
        'message' => 'ورود موفقیت‌آمیز بود.',
        'data' => array(
            'token' => $token['token'],
            'user_id' => $user->ID,
            'username' => $user->user_login,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'phone_number' => get_user_meta($user->ID, 'phone_number', true)
        )
    );
}

function create_new_user_callback($request) {
    $parameters = $request->get_params();
    
    $user_data = array(
        'user_login' => $parameters['username'],
        'user_pass'  => $parameters['password'],
        'user_email' => $parameters['email'],
        'role'       => 'subscriber'
    );
    
    $user_id = wp_insert_user($user_data);
    
    if (is_wp_error($user_id)) {
        return new WP_Error(
            'user_creation_failed',
            $user_id->get_error_message(),
            array('status' => 400)
        );
    }
    
    return array(
        'status' => 'success',
        'user_id' => $user_id
    );
}







// افزودن endpoint برای ریکاوری پسورد
add_action('rest_api_init', function() {
    register_rest_route('wp/v2', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'handle_password_reset_request',
        'permission_callback' => '__return_true'
    ));
});

function handle_password_reset_request($request) {
    $parameters = $request->get_params();
    $user_email = sanitize_email($parameters['email']);
    
    if (empty($user_email)) {
        return new WP_Error('invalid_email', 'لطفا یک ایمیل معتبر وارد کنید.', array('status' => 400));
    }
    
    $user = get_user_by('email', $user_email);
    if (!$user) {
        return new WP_Error('invalid_user', 'کاربری با این ایمیل یافت نشد.', array('status' => 404));
    }
    
    $key = get_password_reset_key($user);
    if (is_wp_error($key)) {
        return new WP_Error('reset_key_error', 'خطا در ایجاد لینک بازیابی رمز عبور.', array('status' => 500));
    }
    
    $reset_link = network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user->user_login));
    
    $message = sprintf('برای بازیابی رمز عبور خود روی لینک زیر کلیک کنید:\n\n%s', $reset_link);
    $subject = 'بازیابی رمز عبور';
    
    if (wp_mail($user_email, $subject, $message)) {
        return array(
            'status' => 'success',
            'message' => 'ایمیل بازیابی رمز عبور ارسال شد.'
        );
    } else {
        return new WP_Error('email_error', 'خطا در ارسال ایمیل.', array('status' => 500));
    }
}










function register_user_with_phone($request) {
    $parameters = $request->get_params();
    
    // بررسی اطلاعات ضروری
    if (empty($parameters['username']) || empty($parameters['email']) || 
        empty($parameters['password']) || empty($parameters['phone_number'])) {
        return new WP_Error('missing_fields', 'لطفا همه فیلدها را پر کنید.', array('status' => 400));
    }

    // بررسی یکتا بودن شماره تلفن
    $existing_user = get_users(array(
        'meta_key' => 'phone_number',
        'meta_value' => $parameters['phone_number'],
        'number' => 1
    ));

    if (!empty($existing_user)) {
        return new WP_Error('phone_exists', 'این شماره تلفن قبلا ثبت شده است.', array('status' => 400));
    }

    // ایجاد کاربر جدید
    $user_id = wp_create_user(
        $parameters['username'],
        $parameters['password'],
        $parameters['email']
    );

    if (is_wp_error($user_id)) {
        return new WP_Error(
            'registration_failed',
            $user_id->get_error_message(),
            array('status' => 400)
        );
    }

    // ذخیره شماره تلفن
    add_user_meta($user_id, 'phone_number', $parameters['phone_number'], true);

    return array(
        'status' => 'success',
        'user_id' => $user_id,
        'user_email' => $parameters['email'],
        'phone_number' => $parameters['phone_number']
    );
}

function login_with_phone($request) {
    $parameters = $request->get_params();

    if (empty($parameters['phone_number']) || empty($parameters['password'])) {
        return new WP_Error('missing_fields', 'لطفا شماره تلفن و رمز عبور را وارد کنید.', array('status' => 400));
    }

    // پیدا کردن کاربر با شماره تلفن
    $users = get_users(array(
        'meta_key' => 'phone_number',
        'meta_value' => $parameters['phone_number'],
        'number' => 1
    ));

    if (empty($users)) {
        return new WP_Error('invalid_phone', 'کاربری با این شماره تلفن یافت نشد.', array('status' => 404));
    }

    $user = $users[0];

    // بررسی پسورد
    if (!wp_check_password($parameters['password'], $user->user_pass, $user->ID)) {
        return new WP_Error('invalid_password', 'رمز عبور اشتباه است.', array('status' => 401));
    }

    // ایجاد توکن JWT
    $token = create_jwt_token($user);

    return array(
        'status' => 'success',
        'token' => $token,
        'user_id' => $user->ID,
        'user_email' => $user->user_email,
        'phone_number' => get_user_meta($user->ID, 'phone_number', true)
    );
}








// در functions.php اضافه کنید
add_action('rest_api_init', function() {
    register_rest_route('transaction/v1', '/verify', array(
        'methods' => 'POST',
        'callback' => 'verify_and_save_transaction',
        'permission_callback' => '__return_true'
    ));
});

function verify_and_save_transaction($request) {
    global $wpdb;
    $hash = $request->get_param('hash');
    $amount = $request->get_param('amount');
    $wallet = $request->get_param('wallet_address');
    $type = $request->get_param('type');
    
    // چک کردن هش تکراری
    $exists = $wpdb->get_var(
        $wpdb->prepare("SELECT hash FROM wp_transactions WHERE hash = %s", $hash)
    );
    
    if ($exists) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'این تراکنش قبلاً ثبت شده است'
        ], 400);
    }
    
    // ثبت تراکنش جدید
    $inserted = $wpdb->insert('wp_transactions', array(
        'hash' => $hash,
        'amount' => $amount,
        'wallet_address' => $wallet,
        'type' => $type
    ));
    
    if ($inserted) {
        return new WP_REST_Response([
            'success' => true,
            'message' => 'تراکنش با موفقیت ثبت شد'
        ], 200);
    }
    
    return new WP_REST_Response([
        'success' => false,
        'message' => 'خطا در ثبت تراکنش'
    ], 500);
}





// اضافه کردن متا باکس برای لینک اسلایدرها
function add_slider_meta_boxes() {
    add_meta_box(
        'slider_link',
        'لینک اسلایدر',
        'slider_link_callback',
        'slider',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_slider_meta_boxes');

// تابع نمایش متا باکس لینک اسلایدر
function slider_link_callback($post) {
    $link = get_post_meta($post->ID, 'slider_link', true);
    $product_name = get_post_meta($post->ID, 'slider_product_name', true);
    $product_price = get_post_meta($post->ID, 'slider_product_price', true);
    wp_nonce_field('slider_link_nonce', 'slider_link_nonce');
    ?>
    <div style="margin-bottom: 10px;">
        <label for="slider_link">مسیر داخلی برنامه یا آدرس خارجی:</label>
    </div>
    <input 
        type="text" 
        id="slider_link" 
        name="slider_link" 
        value="<?php echo esc_attr($link); ?>" 
        style="width: 100%; padding: 8px;"
        placeholder="برای باز کردن صفحه پرداخت: PAYMENT"
    />
    
    <div style="margin-bottom: 10px; margin-top: 15px;">
        <label for="slider_product_name">نام پکیج (برای پرداخت):</label>
    </div>
    <input 
        type="text" 
        id="slider_product_name" 
        name="slider_product_name" 
        value="<?php echo esc_attr($product_name); ?>" 
        style="width: 100%; padding: 8px;"
        placeholder="مثال: اشتراک VIP"
    />
    
    <div style="margin-bottom: 10px; margin-top: 15px;">
        <label for="slider_product_price">قیمت (دلار):</label>
    </div>
    <input 
        type="number" 
        id="slider_product_price" 
        name="slider_product_price" 
        value="<?php echo esc_attr($product_price); ?>" 
        style="width: 100%; padding: 8px;"
        placeholder="مثال: 50"
    />
    <p class="description">
        برای صفحات داخلی برنامه از مسیر (همراه با خط اسلش) مثل "/vip" استفاده کنید.<br>
        برای لینک‌های خارجی، آدرس کامل را وارد کنید.<br>
        برای باز کردن صفحه پرداخت، کلمه PAYMENT را وارد کنید.
    </p>
    <?php
}

// ذخیره متا دیتای لینک اسلایدر
function save_slider_meta($post_id) {
    // بررسی nonce
    if (!isset($_POST['slider_link_nonce']) || !wp_verify_nonce($_POST['slider_link_nonce'], 'slider_link_nonce')) {
        return;
    }

    // بررسی autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // بررسی دسترسی‌ها
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // ذخیره لینک
    if (isset($_POST['slider_link'])) {
        update_post_meta(
            $post_id,
            'slider_link',
            sanitize_text_field($_POST['slider_link'])
        );
    }
    
    // ذخیره نام محصول
    if (isset($_POST['slider_product_name'])) {
        update_post_meta(
            $post_id,
            'slider_product_name',
            sanitize_text_field($_POST['slider_product_name'])
        );
    }
    
    // ذخیره قیمت محصول
    if (isset($_POST['slider_product_price'])) {
        update_post_meta(
            $post_id,
            'slider_product_price',
            sanitize_text_field($_POST['slider_product_price'])
        );
    }
}
add_action('save_post', 'save_slider_meta');

// اضافه کردن متادیتا به REST API
function add_slider_meta_to_api() {
    register_rest_field('slider', 'meta', array(
        'get_callback' => function($post) {
            return array(
                'slider_link' => get_post_meta($post['id'], 'slider_link', true),
                'slider_product_name' => get_post_meta($post['id'], 'slider_product_name', true),
                'slider_product_price' => get_post_meta($post['id'], 'slider_product_price', true)
            );
        }
    ));
}
add_action('rest_api_init', 'add_slider_meta_to_api');







// Register custom post type for LBank UIDs
function register_lbank_uid_post_type() {
    $labels = array(
        'name'               => 'درخواست‌های UID',
        'singular_name'      => 'درخواست UID',
        'menu_name'          => 'درخواست‌های UID',
        'add_new'            => 'افزودن درخواست جدید',
        'add_new_item'       => 'افزودن درخواست UID جدید',
        'edit_item'          => 'ویرایش درخواست UID',
        'new_item'           => 'درخواست UID جدید',
        'view_item'          => 'مشاهده درخواست UID',
        'search_items'       => 'جستجوی درخواست‌ها',
        'not_found'          => 'درخواستی یافت نشد',
        'not_found_in_trash' => 'در زباله‌دان درخواستی یافت نشد',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => false,
        'show_in_admin_bar'   => true,
        'menu_position'       => 25,
        'menu_icon'           => 'dashicons-id',
        'capability_type'     => 'post',
        'hierarchical'        => false,
        'supports'            => array('title'),
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'show_in_rest'        => true, // Enable REST API for this post type
    );

    register_post_type('lbank_uid', $args);
}
add_action('init', 'register_lbank_uid_post_type');

// Add meta boxes for UID post type
function add_lbank_uid_meta_boxes() {
    add_meta_box(
        'lbank_uid_details',
        'اطلاعات UID',
        'lbank_uid_details_callback',
        'lbank_uid',
        'normal',
        'high'
    );

    add_meta_box(
        'lbank_uid_status',
        'وضعیت درخواست',
        'lbank_uid_status_callback',
        'lbank_uid',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'add_lbank_uid_meta_boxes');

// UID details meta box callback
function lbank_uid_details_callback($post) {
    wp_nonce_field('lbank_uid_details_nonce', 'lbank_uid_details_nonce');
    
    $uid = get_post_meta($post->ID, 'lbank_uid', true);
    $user_id = get_post_meta($post->ID, 'user_id', true);
    $submission_date = get_post_meta($post->ID, 'submission_date', true);
    $balance = get_post_meta($post->ID, 'balance', true);
    
    $user_info = '';
    if ($user_id) {
        $user = get_userdata($user_id);
        if ($user) {
            $user_info = '<div class="user-info">
                <p><strong>کاربر:</strong> ' . esc_html($user->display_name) . ' (' . esc_html($user->user_email) . ')</p>
                <p><strong>شماره تلفن:</strong> ' . esc_html(get_user_meta($user_id, 'phone_number', true)) . '</p>
            </div>';
        }
    }
    
    echo '<div class="lbank-uid-details">';
    
    echo $user_info;
    
    echo '<table class="form-table">
        <tr>
            <th><label for="lbank_uid">کد UID:</label></th>
            <td><input type="text" id="lbank_uid" name="lbank_uid" value="' . esc_attr($uid) . '" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="balance">موجودی حساب (دلار):</label></th>
            <td><input type="text" id="balance" name="balance" value="' . esc_attr($balance) . '" style="width: 100%"></td>
        </tr>
        <tr>
            <th>تاریخ ثبت:</th>
            <td>' . ($submission_date ? date_i18n('Y/m/d H:i:s', strtotime($submission_date)) : '-') . '</td>
        </tr>
    </table>';
    
    echo '</div>';
}

// Status meta box callback
function lbank_uid_status_callback($post) {
    wp_nonce_field('lbank_uid_status_nonce', 'lbank_uid_status_nonce');
    
    $status = get_post_meta($post->ID, 'status', true);
    if (!$status) {
        $status = 'pending';
    }
    
    $status_options = array(
        'pending' => 'در انتظار بررسی',
        'approved' => 'تایید شده',
        'rejected' => 'رد شده'
    );
    
    echo '<select name="status" id="status" style="width: 100%">';
    foreach ($status_options as $value => $label) {
        echo '<option value="' . esc_attr($value) . '" ' . selected($status, $value, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';
    
    echo '<div class="rejection-reason" style="margin-top: 10px; ' . ($status == 'rejected' ? '' : 'display: none;') . '">';
    echo '<label for="rejection_reason">دلیل رد درخواست:</label>';
    echo '<textarea name="rejection_reason" id="rejection_reason" style="width: 100%; margin-top: 5px;">' . esc_textarea(get_post_meta($post->ID, 'rejection_reason', true)) . '</textarea>';
    echo '</div>';
    
    // JavaScript to show/hide rejection reason
    echo '<script type="text/javascript">
        jQuery(document).ready(function($) {
            $("#status").change(function() {
                if ($(this).val() === "rejected") {
                    $(".rejection-reason").show();
                } else {
                    $(".rejection-reason").hide();
                }
            });
        });
    </script>';
}

// Save meta box data
function save_lbank_uid_meta($post_id) {
    // Check if our nonce is set
    if (!isset($_POST['lbank_uid_details_nonce']) || !isset($_POST['lbank_uid_status_nonce'])) {
        return;
    }
    
    // Verify the nonces
    if (!wp_verify_nonce($_POST['lbank_uid_details_nonce'], 'lbank_uid_details_nonce') ||
        !wp_verify_nonce($_POST['lbank_uid_status_nonce'], 'lbank_uid_status_nonce')) {
        return;
    }
    
    // If this is an autosave, we don't want to do anything
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check the user's permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Save UID data
    if (isset($_POST['lbank_uid'])) {
        update_post_meta($post_id, 'lbank_uid', sanitize_text_field($_POST['lbank_uid']));
    }
    
    if (isset($_POST['balance'])) {
        update_post_meta($post_id, 'balance', sanitize_text_field($_POST['balance']));
    }
    
    // Save status data
    if (isset($_POST['status'])) {
        $new_status = sanitize_text_field($_POST['status']);
        $old_status = get_post_meta($post_id, 'status', true);
        
        update_post_meta($post_id, 'status', $new_status);
        
        // If status has changed to rejected, save rejection reason
        if ($new_status === 'rejected' && isset($_POST['rejection_reason'])) {
            update_post_meta($post_id, 'rejection_reason', sanitize_textarea_field($_POST['rejection_reason']));
        }
        
        // If status has changed, trigger actions
        if ($old_status !== $new_status) {
            do_action('lbank_uid_status_changed', $post_id, $new_status, $old_status);
        }
    }
}
add_action('save_post_lbank_uid', 'save_lbank_uid_meta');

// Add custom columns to admin list
function lbank_uid_custom_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'درخواست UID';
    $new_columns['uid'] = 'UID';
    $new_columns['user'] = 'کاربر';
    $new_columns['balance'] = 'موجودی';
    $new_columns['status'] = 'وضعیت';
    $new_columns['date'] = $columns['date'];
    
    return $new_columns;
}
add_filter('manage_lbank_uid_posts_columns', 'lbank_uid_custom_columns');

// Fill custom columns data
function lbank_uid_fill_columns($column, $post_id) {
    switch ($column) {
        case 'uid':
            echo esc_html(get_post_meta($post_id, 'lbank_uid', true));
            break;
            
        case 'user':
            $user_id = get_post_meta($post_id, 'user_id', true);
            if ($user_id) {
                $user = get_userdata($user_id);
                if ($user) {
                    echo esc_html($user->display_name) . ' (' . esc_html($user->user_email) . ')';
                }
            } else {
                echo '-';
            }
            break;
            
        case 'balance':
            $balance = get_post_meta($post_id, 'balance', true);
            echo $balance ? esc_html($balance) . ' $' : '-';
            break;
            
        case 'status':
            $status = get_post_meta($post_id, 'status', true);
            $status_labels = array(
                'pending' => '<span style="color: #f39c12;">در انتظار بررسی</span>',
                'approved' => '<span style="color: #27ae60;">تایید شده</span>',
                'rejected' => '<span style="color: #e74c3c;">رد شده</span>'
            );
            echo isset($status_labels[$status]) ? $status_labels[$status] : esc_html($status);
            break;
    }
}
add_action('manage_lbank_uid_posts_custom_column', 'lbank_uid_fill_columns', 10, 2);

// Make columns sortable
function lbank_uid_sortable_columns($columns) {
    $columns['uid'] = 'uid';
    $columns['status'] = 'status';
    $columns['balance'] = 'balance';
    return $columns;
}
add_filter('manage_edit-lbank_uid_sortable_columns', 'lbank_uid_sortable_columns');

// Handle sorting
function lbank_uid_sort_columns($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    if ($query->get('post_type') !== 'lbank_uid') {
        return;
    }
    
    $orderby = $query->get('orderby');
    
    switch ($orderby) {
        case 'uid':
            $query->set('meta_key', 'lbank_uid');
            $query->set('orderby', 'meta_value');
            break;
            
        case 'status':
            $query->set('meta_key', 'status');
            $query->set('orderby', 'meta_value');
            break;
            
        case 'balance':
            $query->set('meta_key', 'balance');
            $query->set('orderby', 'meta_value_num');
            break;
    }
}
add_action('pre_get_posts', 'lbank_uid_sort_columns');

// Add status filter dropdown
function lbank_uid_filter_dropdown() {
    global $typenow;
    
    if ($typenow != 'lbank_uid') {
        return;
    }
    
    $status = isset($_GET['uid_status']) ? $_GET['uid_status'] : '';
    
    $statuses = array(
        'pending' => 'در انتظار بررسی',
        'approved' => 'تایید شده',
        'rejected' => 'رد شده'
    );
    
    echo '<select name="uid_status">';
    echo '<option value="">همه وضعیت‌ها</option>';
    
    foreach ($statuses as $value => $label) {
        echo '<option value="' . esc_attr($value) . '" ' . selected($status, $value, false) . '>' . esc_html($label) . '</option>';
    }
    
    echo '</select>';
}
add_action('restrict_manage_posts', 'lbank_uid_filter_dropdown');

// Handle status filter
function lbank_uid_filter_query($query) {
    global $pagenow, $typenow;
    
    if ($pagenow === 'edit.php' && $typenow === 'lbank_uid' && isset($_GET['uid_status']) && $_GET['uid_status']) {
        $query->query_vars['meta_key'] = 'status';
        $query->query_vars['meta_value'] = $_GET['uid_status'];
    }
}
add_action('pre_get_posts', 'lbank_uid_filter_query');

// Add REST API endpoint for mobile app
add_action('rest_api_init', function() {
    register_rest_route('lbank/v1', '/submit-uid', array(
        'methods' => 'POST',
        'callback' => 'handle_uid_submission',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
    
    register_rest_route('lbank/v1', '/check-uid-status', array(
        'methods' => 'GET',
        'callback' => 'check_uid_status',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

// Handle UID submission from mobile app
function handle_uid_submission($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'not_logged_in',
            'کاربر وارد نشده است.',
            array('status' => 401)
        );
    }
    
    $parameters = $request->get_params();
    
    if (empty($parameters['uid'])) {
        return new WP_Error(
            'invalid_uid',
            'کد UID نامعتبر است.',
            array('status' => 400)
        );
    }
    
    $uid = sanitize_text_field($parameters['uid']);
    
    // Check if this user already has a pending or approved UID
    $existing_uids = get_posts(array(
        'post_type' => 'lbank_uid',
        'meta_query' => array(
            array(
                'key' => 'user_id',
                'value' => $user_id
            ),
            array(
                'key' => 'status',
                'value' => array('pending', 'approved'),
                'compare' => 'IN'
            )
        ),
        'posts_per_page' => 1
    ));
    
    if (!empty($existing_uids)) {
        $existing_status = get_post_meta($existing_uids[0]->ID, 'status', true);
        $status_message = $existing_status === 'approved' ? 'تایید شده' : 'در انتظار بررسی';
        
        return new WP_Error(
            'uid_exists',
            'شما قبلاً یک درخواست ثبت کرده اید که ' . $status_message . ' است . در ۲۴ ساعت آینده در قسمت پشتیبانی به شما اطلاع داده داده خواهد شد',
            array('status' => 400)
        );
    }
    
    // Create a new UID request
    $post_id = wp_insert_post(array(
        'post_title' => 'درخواست UID از کاربر ' . $user_id,
        'post_type' => 'lbank_uid',
        'post_status' => 'publish'
    ));
    
    if (is_wp_error($post_id)) {
        return new WP_Error(
            'submission_error',
            'خطا در ثبت درخواست: ' . $post_id->get_error_message(),
            array('status' => 500)
        );
    }
    
    // Add meta data
    update_post_meta($post_id, 'lbank_uid', $uid);
    update_post_meta($post_id, 'user_id', $user_id);
    update_post_meta($post_id, 'submission_date', current_time('mysql'));
    update_post_meta($post_id, 'status', 'pending');
    
    // Balance will be added by admin during review
    
    return array(
        'success' => true,
        'message' => 'درخواست UID شما با موفقیت ثبت شد و در انتظار بررسی است.',
        'request_id' => $post_id
    );
}

// Check UID request status
function check_uid_status($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'not_logged_in',
            'کاربر وارد نشده است.',
            array('status' => 401)
        );
    }
    
    // Find the user's UID requests
    $uid_requests = get_posts(array(
        'post_type' => 'lbank_uid',
        'meta_query' => array(
            array(
                'key' => 'user_id',
                'value' => $user_id
            )
        ),
        'posts_per_page' => -1
    ));
    
    if (empty($uid_requests)) {
        return array(
            'has_request' => false,
            'message' => 'شما هیچ درخواست UID ثبت نکرده‌اید.'
        );
    }
    
    $results = array();
    
    foreach ($uid_requests as $request) {
        $status = get_post_meta($request->ID, 'status', true);
        $uid = get_post_meta($request->ID, 'lbank_uid', true);
        $submission_date = get_post_meta($request->ID, 'submission_date', true);
        $balance = get_post_meta($request->ID, 'balance', true);
        
        $status_text = '';
        switch ($status) {
            case 'pending':
                $status_text = 'در انتظار بررسی';
                break;
            case 'approved':
                $status_text = 'تایید شده';
                break;
            case 'rejected':
                $status_text = 'رد شده';
                break;
            default:
                $status_text = $status;
        }
        
        $result = array(
            'request_id' => $request->ID,
            'uid' => $uid,
            'status' => $status,
            'status_text' => $status_text,
            'submission_date' => $submission_date
        );
        
        if ($status === 'approved' && $balance) {
            $result['balance'] = $balance;
        }
        
        if ($status === 'rejected') {
            $result['rejection_reason'] = get_post_meta($request->ID, 'rejection_reason', true);
        }
        
        $results[] = $result;
    }
    
    return array(
        'has_request' => true,
        'requests' => $results
    );
}











// فرستادن پیام به Awesome Support هنگام رد درخواست UID
function send_support_message_on_uid_rejection($post_id, $new_status, $old_status) {
    // فقط وقتی وضعیت به "رد شده" تغییر کرده اجرا شود
    if ($new_status === 'rejected' && $old_status !== 'rejected') {
        // دریافت اطلاعات درخواست
        $user_id = get_post_meta($post_id, 'user_id', true);
        $uid = get_post_meta($post_id, 'lbank_uid', true);
        $rejection_reason = get_post_meta($post_id, 'rejection_reason', true);
        
        if (!$user_id) {
            error_log('خطا: کاربری برای درخواست UID یافت نشد.');
            return; // اگر کاربر وجود نداشت، خارج شود
        }
        
        // دریافت اطلاعات کاربر
        $user = get_userdata($user_id);
        if (!$user) {
            error_log('خطا: اطلاعات کاربر ' . $user_id . ' قابل دریافت نیست.');
            return; // اگر اطلاعات کاربر قابل دریافت نبود، خارج شود
        }
        
        // پیام برای ارسال به کاربر
 $message = sprintf(
    "کاربر گرامی %s،\n\n🎉 پرداخت شما با موفقیت تایید شد!\n\n✅ سرویس: %s\n✅ وضعیت: فعال شده\n\nحالا می‌توانید از دوره استفاده کنید.\n\nبا تشکر از انتخاب شما 🙏",
    $user->display_name,
    $product_title
);
        
        // بررسی تیکت‌های فعال کاربر
        $args = array(
            'post_type'      => 'ticket',
            'author'         => $user_id,
            'post_status'    => 'any',
            'posts_per_page' => 1,
            'meta_query'     => array(
                array(
                    'key'     => '_wpas_status',
                    'value'   => array('open', 'pending'),
                    'compare' => 'IN'
                )
            )
        );
        
        $tickets = get_posts($args);
        
        if (!empty($tickets)) {
            $ticket_id = $tickets[0]->ID;
            error_log('تیکت فعال برای کاربر یافت شد: ' . $ticket_id);
            
            // ایجاد یک پاسخ به تیکت موجود
            $reply_args = array(
                'post_content'   => $message,
                'post_status'    => 'publish',
                'post_author'    => 1, // آیدی ادمین
                'post_type'      => 'ticket_reply',
                'post_parent'    => $ticket_id,
                'post_title'     => sprintf('پاسخ به تیکت #%d', $ticket_id),
                'comment_status' => 'closed'
            );
            
            $reply_id = wp_insert_post($reply_args);
            
            if (is_wp_error($reply_id)) {
                error_log('خطا در ایجاد پاسخ: ' . $reply_id->get_error_message());
            } else {
                // اضافه کردن متادیتا به پاسخ
                add_post_meta($reply_id, '_wpas_status', 'read');
                add_post_meta($reply_id, '_wpas_is_reply', true);
                add_post_meta($reply_id, '_wpas_user_type', 'agent');
                
                // بروزرسانی وضعیت تیکت
                update_post_meta($ticket_id, '_wpas_status', 'open');
                
                error_log('پاسخ به تیکت موجود با موفقیت ایجاد شد: ' . $reply_id);
            }
        } else {
            error_log('تیکت فعالی برای کاربر یافت نشد. در حال ایجاد تیکت جدید...');
            
            // ایجاد تیکت جدید
            $ticket_args = array(
                'post_title'     => 'اطلاعیه رد درخواست UID',
                'post_content'   => $message,
                'post_status'    => 'publish',
                'post_type'      => 'ticket',
                'post_author'    => $user_id, // کاربر به عنوان نویسنده اصلی تیکت
                'comment_status' => 'closed'
            );
            
            $ticket_id = wp_insert_post($ticket_args);
            
            if (is_wp_error($ticket_id)) {
                error_log('خطا در ایجاد تیکت: ' . $ticket_id->get_error_message());
            } else {
                // افزودن متادیتای لازم
                add_post_meta($ticket_id, '_wpas_status', 'open');
                add_post_meta($ticket_id, '_wpas_last_reply_date', current_time('mysql'));
                add_post_meta($ticket_id, '_wpas_last_reply_date_gmt', current_time('mysql', true));
                add_post_meta($ticket_id, '_wpas_is_waiting_client_reply', 1);
                add_post_meta($ticket_id, '_wpas_assignee', 1); // اختصاص به ادمین
                
                // اضافه کردن متادیتای اضافی
                add_post_meta($ticket_id, '_wpas_ticket_channel', 'system');
                add_post_meta($ticket_id, '_wpas_opened_by', 1); // باز شده توسط ادمین
                
                error_log('تیکت جدید با موفقیت ایجاد شد: ' . $ticket_id);
                
                // حالا یک پاسخ از طرف ادمین اضافه می‌کنیم
                $reply_args = array(
                    'post_content'   => $message,
                    'post_status'    => 'publish',
                    'post_author'    => 1, // آیدی ادمین
                    'post_type'      => 'ticket_reply',
                    'post_parent'    => $ticket_id,
                    'post_title'     => sprintf('پاسخ به تیکت #%d', $ticket_id),
                    'comment_status' => 'closed'
                );
                
                $reply_id = wp_insert_post($reply_args);
                
                if (!is_wp_error($reply_id)) {
                    // اضافه کردن متادیتا به پاسخ
                    add_post_meta($reply_id, '_wpas_status', 'read');
                    add_post_meta($reply_id, '_wpas_is_reply', true);
                    add_post_meta($reply_id, '_wpas_user_type', 'agent');
                    
                    error_log('پاسخ ادمین به تیکت جدید با موفقیت ایجاد شد: ' . $reply_id);
                }
            }
        }
    }
}
add_action('lbank_uid_status_changed', 'send_support_message_on_uid_rejection', 10, 3);









// در functions.php سایت وردپرس
add_action('wp_ajax_submit_mentor_request', 'handle_mentor_request');
add_action('wp_ajax_nopriv_submit_mentor_request', 'handle_mentor_request');

function handle_mentor_request() {
    // بررسی امنیت
    // check_ajax_referer('mentor_request_nonce', 'security');
    
    // دریافت داده‌ها
    $fullname = sanitize_text_field($_POST['fullname']);
    $email = sanitize_email($_POST['email']);
    $phone = sanitize_text_field($_POST['phone']);
    $capital = sanitize_text_field($_POST['capital']);
    
    // ایجاد پست
    $post_id = wp_insert_post([
        'post_title' => 'درخواست منتور - ' . $fullname,
        'post_content' => "
            <p><strong>نام و نام خانوادگی:</strong> {$fullname}</p>
            <p><strong>ایمیل:</strong> {$email}</p>
            <p><strong>شماره تماس:</strong> {$phone}</p>
            <p><strong>میزان سرمایه:</strong> {$capital} دلار</p>
        ",
        'post_status' => 'private',
        'post_type' => 'post',
        'post_author' => 1,
    ]);
    
    // ذخیره متادیتا
    if ($post_id) {
        add_post_meta($post_id, 'mentor_fullname', $fullname);
        add_post_meta($post_id, 'mentor_email', $email);
        add_post_meta($post_id, 'mentor_phone', $phone);
        add_post_meta($post_id, 'mentor_capital', $capital);
        
        // اختصاص دسته‌بندی
        wp_set_post_categories($post_id, [9]); // شماره دسته‌بندی مناسب
        
        // ارسال ایمیل به مدیر سایت
        $admin_email = get_option('admin_email');
        $subject = 'درخواست منتور جدید - ' . $fullname;
        $message = "
            درخواست منتور جدیدی ثبت شده است:
            
            نام و نام خانوادگی: {$fullname}
            ایمیل: {$email}
            شماره تماس: {$phone}
            میزان سرمایه: {$capital} دلار
            
            برای مشاهده به پنل مدیریت مراجعه کنید.
        ";
        
        wp_mail($admin_email, $subject, $message);
        
        wp_send_json_success('درخواست با موفقیت ثبت شد.');
    } else {
        wp_send_json_error('خطا در ثبت درخواست.');
    }
    
    wp_die();
}







// تولید شورتکد [my_active_subscriptions]
function my_active_subscriptions_shortcode() {
    if ( ! function_exists( 'wcs_get_users_subscriptions' ) ) {
        return '<p>افزونه سابسکریپشن فعال نیست.</p>';
    }
    $subscriptions = wcs_get_users_subscriptions( get_current_user_id() );
    if ( empty( $subscriptions ) ) {
        return '<p>هیچ اشتراک فعالی ندارید.</p>';
    }
    $out = '<ul>';
    foreach ( $subscriptions as $subscription ) {
        foreach ( $subscription->get_items() as $item ) {
            $out .= '<li>' . esc_html( $item->get_name() ) . '</li>';
        }
    }
    $out .= '</ul>';
    return $out;
}
add_shortcode( 'my_active_subscriptions', 'my_active_subscriptions_shortcode' );









// ثبت endpoint برای ذخیره خرید
add_action('rest_api_init', function() {
    register_rest_route('pcs/v1', '/save-purchase', array(
        'methods' => 'POST',
        'callback' => 'save_user_purchase',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

// تابع ذخیره خرید کاربر
function save_user_purchase($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'not_logged_in',
            'کاربر وارد نشده است.',
            array('status' => 401)
        );
    }
    
    $parameters = $request->get_params();
    
    // بررسی پارامترهای ضروری
    if (empty($parameters['transaction_hash']) || empty($parameters['product_title'])) {
        return new WP_Error(
            'missing_parameters',
            'اطلاعات ناقص است.',
            array('status' => 400)
        );
    }
    
    $transaction_hash = sanitize_text_field($parameters['transaction_hash']);
    $product_title = sanitize_text_field($parameters['product_title']);
    $price = isset($parameters['price']) ? sanitize_text_field($parameters['price']) : '';
    $duration_months = isset($parameters['duration_months']) ? intval($parameters['duration_months']) : 1;
    
    // بررسی عدم تکرار تراکنش
    global $wpdb;
    $existing_purchase = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'user_purchase' AND post_title = %s",
            $transaction_hash
        )
    );
    
    if ($existing_purchase) {
        return new WP_Error(
            'duplicate_purchase',
            'این تراکنش قبلاً ثبت شده است.',
            array('status' => 400)
        );
    }
    
    // ایجاد پست خرید جدید
    $post_id = wp_insert_post(array(
        'post_title' => $transaction_hash,
        'post_type' => 'user_purchase',
        'post_status' => 'publish',
        'post_author' => $user_id
    ));
    
    if (is_wp_error($post_id)) {
        return new WP_Error(
            'save_error',
            'خطا در ذخیره خرید: ' . $post_id->get_error_message(),
            array('status' => 500)
        );
    }
    
    // ذخیره متا دیتا
    update_post_meta($post_id, 'product_title', $product_title);
    update_post_meta($post_id, 'price', $price);
    update_post_meta($post_id, 'duration_months', $duration_months);
    update_post_meta($post_id, 'purchase_date', current_time('mysql'));
    update_post_meta($post_id, 'expiry_date', date('Y-m-d H:i:s', strtotime('+' . $duration_months . ' months')));
    update_post_meta($post_id, 'status', 'active');
    
    // اگر محصول VIP است، یک فلگ اضافه کنیم
    if (stripos($product_title, 'vip') !== false) {
        update_post_meta($post_id, 'is_vip', true);
    }
    
    // ذخیره اطلاعات خرید در متادیتای کاربر
    $user_purchases = get_user_meta($user_id, 'user_purchases', true);
    if (!is_array($user_purchases)) {
        $user_purchases = array();
    }
    
    $user_purchases[] = array(
        'id' => $post_id,
        'transaction_hash' => $transaction_hash,
        'product_title' => $product_title,
        'purchase_date' => current_time('mysql'),
        'expiry_date' => date('Y-m-d H:i:s', strtotime('+' . $duration_months . ' months')),
        'status' => 'active'
    );
    
    update_user_meta($user_id, 'user_purchases', $user_purchases);
    
    return array(
        'success' => true,
        'message' => 'خرید با موفقیت ذخیره شد.',
        'purchase_id' => $post_id
    );
} // این } گم شده بود

// تابع تمدید اشتراک موجود
// تابع تمدید اشتراک موجود - نسخه بهبود یافته
function renew_user_subscription($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error('not_logged_in', 'کاربر وارد نشده است.', array('status' => 401));
    }
    
    $parameters = $request->get_params();
    
    if (empty($parameters['transaction_hash']) || empty($parameters['product_title'])) {
        return new WP_Error('missing_parameters', 'اطلاعات ناقص است.', array('status' => 400));
    }
    
    $transaction_hash = sanitize_text_field($parameters['transaction_hash']);
    $product_title = sanitize_text_field($parameters['product_title']);
    $additional_months = isset($parameters['additional_months']) ? intval($parameters['additional_months']) : 1;
    $additional_days = $additional_months * 30;
    
    // تشخیص نوع محصول
    $is_vip = (stripos($product_title, 'vip') !== false);
    $is_mim_coin = (stripos($product_title, 'میم کوین') !== false);
    
    // جستجوی محصول موجود بر اساس نوع
    $search_terms = array();
    if ($is_vip) {
        $search_terms = array('vip', 'VIP');
    } elseif ($is_mim_coin) {
        $search_terms = array('میم کوین', 'مم کوین');
    } else {
        // برای سایر محصولات، حذف کلمه تمدید از ابتدای عنوان
        $clean_title = preg_replace('/^تمدید\s+/u', '', $product_title);
        $search_terms = array($clean_title);
    }
    
    // پیدا کردن محصول موجود کاربر
    $meta_query = array(
        'relation' => 'AND',
        array(
            'key' => 'status',
            'value' => 'active',
            'compare' => '='
        )
    );
    
    // اضافه کردن شرط جستجو بر اساس نوع محصول
    if (count($search_terms) > 1) {
        $title_query = array('relation' => 'OR');
        foreach ($search_terms as $term) {
            $title_query[] = array(
                'key' => 'product_title',
                'value' => $term,
                'compare' => 'LIKE'
            );
        }
        $meta_query[] = $title_query;
    } else {
        $meta_query[] = array(
            'key' => 'product_title',
            'value' => $search_terms[0],
            'compare' => 'LIKE'
        );
    }
    
    $args = array(
        'post_type' => 'user_purchase',
        'author' => $user_id,
        'posts_per_page' => 1,
        'post_status' => 'publish',
        'meta_query' => $meta_query
    );
    
    $existing_purchases = get_posts($args);
    
    if (empty($existing_purchases)) {
        return new WP_Error('no_existing_purchase', 'اشتراک فعالی برای تمدید یافت نشد.', array('status' => 404));
    }
    
    $existing_purchase = $existing_purchases[0];
    
    // ایجاد رکورد تمدید جداگانه برای ردیابی
    $renewal_post_id = wp_insert_post(array(
        'post_title' => $transaction_hash . ' - تمدید',
        'post_type' => 'user_purchase',
        'post_status' => 'publish',
        'post_author' => $user_id
    ));
    
    if (!is_wp_error($renewal_post_id)) {
        // ذخیره متا دیتای تمدید
        update_post_meta($renewal_post_id, 'product_title', 'تمدید ' . get_post_meta($existing_purchase->ID, 'product_title', true));
        update_post_meta($renewal_post_id, 'price', isset($parameters['price']) ? sanitize_text_field($parameters['price']) : '');
        update_post_meta($renewal_post_id, 'duration_months', $additional_months);
        update_post_meta($renewal_post_id, 'purchase_date', current_time('mysql'));
        update_post_meta($renewal_post_id, 'status', 'renewal'); // وضعیت خاص برای تمدید
        update_post_meta($renewal_post_id, 'is_renewal', true); // فلگ تمدید
        update_post_meta($renewal_post_id, 'original_purchase_id', $existing_purchase->ID); // لینک به خرید اصلی
        update_post_meta($renewal_post_id, 'is_vip', get_post_meta($existing_purchase->ID, 'is_vip', true));
    }
    
    // دریافت تاریخ انقضای فعلی
    $current_expiry = get_post_meta($existing_purchase->ID, 'expiry_date', true);
    
    if (empty($current_expiry)) {
        // اگر تاریخ انقضا وجود ندارد، از تاریخ خرید + یک ماه استفاده کنیم
        $purchase_date = get_post_meta($existing_purchase->ID, 'purchase_date', true);
        $current_expiry = date('Y-m-d H:i:s', strtotime($purchase_date . ' +1 month'));
    }
    
    // اضافه کردن زمان جدید
    $new_expiry = date('Y-m-d H:i:s', strtotime($current_expiry . ' +' . $additional_days . ' days'));
    
    // بروزرسانی تاریخ انقضا در خرید اصلی
    update_post_meta($existing_purchase->ID, 'expiry_date', $new_expiry);
    update_post_meta($existing_purchase->ID, 'last_renewal_date', current_time('mysql'));
    update_post_meta($existing_purchase->ID, 'last_renewal_transaction', $transaction_hash);
    
    // محاسبه روزهای باقیمانده جدید
    $now = new DateTime();
    $expiry = new DateTime($new_expiry);
    $interval = $now->diff($expiry);
    $remaining_days = $interval->days;
    
    return array(
        'success' => true,
        'message' => 'اشتراک با موفقیت تمدید شد.',
        'new_expiry_date' => $new_expiry,
        'remaining_days' => $remaining_days,
        'purchase_id' => $existing_purchase->ID,
        'renewal_record_id' => $renewal_post_id
    );
}

// ثبت endpoint برای تمدید
add_action('rest_api_init', function() {
    register_rest_route('pcs/v1', '/renew-subscription', array(
        'methods' => 'POST',
        'callback' => 'renew_user_subscription',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});








// این کد را در فایل functions.php سایت وردپرس اضافه کنید

// ثبت Custom Post Type برای خریدهای کاربران
function register_user_purchase_post_type() {
    register_post_type('user_purchase',
        array(
            'labels' => array(
                'name' => 'خریدهای کاربران',
                'singular_name' => 'خرید کاربر',
                'add_new' => 'افزودن خرید جدید',
                'add_new_item' => 'افزودن خرید جدید',
                'edit_item' => 'ویرایش خرید',
                'all_items' => 'همه خریدها'
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
            'menu_position' => 25,
            'menu_icon' => 'dashicons-cart',
            'supports' => array('title'),
            'has_archive' => false,
            'show_in_rest' => true
        )
    );
}
add_action('init', 'register_user_purchase_post_type');

// اضافه کردن متاباکس برای اطلاعات خرید
function add_user_purchase_meta_boxes() {
    add_meta_box(
        'user_purchase_details',
        'اطلاعات خرید',
        'user_purchase_details_callback',
        'user_purchase',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_user_purchase_meta_boxes');

// نمایش اطلاعات خرید در متاباکس
function user_purchase_details_callback($post) {
    wp_nonce_field('user_purchase_details_nonce', 'user_purchase_details_nonce');
    
    $product_title = get_post_meta($post->ID, 'product_title', true);
    $price = get_post_meta($post->ID, 'price', true);
    $duration_months = get_post_meta($post->ID, 'duration_months', true);
    $purchase_date = get_post_meta($post->ID, 'purchase_date', true);
    $expiry_date = get_post_meta($post->ID, 'expiry_date', true);
    $status = get_post_meta($post->ID, 'status', true);
    $is_vip = get_post_meta($post->ID, 'is_vip', true);
    
    // دریافت اطلاعات کاربر
    $user_id = $post->post_author;
    $user = get_userdata($user_id);
    
    ?>
    <div class="user-info" style="margin-bottom: 15px; padding: 10px; background: #f1f1f1; border-radius: 5px;">
        <p><strong>کاربر:</strong> <?php echo $user ? esc_html($user->display_name) : ''; ?> (<?php echo $user ? esc_html($user->user_email) : ''; ?>)</p>
    </div>
    
    <table class="form-table">
        <tr>
            <th><label for="product_title">نام محصول:</label></th>
            <td><input type="text" id="product_title" name="product_title" value="<?php echo esc_attr($product_title); ?>" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="price">قیمت:</label></th>
            <td><input type="text" id="price" name="price" value="<?php echo esc_attr($price); ?>" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="duration_months">مدت اشتراک (ماه):</label></th>
            <td><input type="number" id="duration_months" name="duration_months" value="<?php echo esc_attr($duration_months); ?>" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="purchase_date">تاریخ خرید:</label></th>
            <td><input type="text" id="purchase_date" name="purchase_date" value="<?php echo esc_attr($purchase_date); ?>" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="expiry_date">تاریخ انقضا:</label></th>
            <td><input type="text" id="expiry_date" name="expiry_date" value="<?php echo esc_attr($expiry_date); ?>" style="width: 100%"></td>
        </tr>
        <tr>
            <th><label for="status">وضعیت:</label></th>
            <td>
                <select id="status" name="status" style="width: 100%">
                    <option value="active" <?php selected($status, 'active'); ?>>فعال</option>
                    <option value="expired" <?php selected($status, 'expired'); ?>>منقضی شده</option>
                    <option value="canceled" <?php selected($status, 'canceled'); ?>>لغو شده</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="is_vip">VIP:</label></th>
            <td>
                <input type="checkbox" id="is_vip" name="is_vip" value="1" <?php checked($is_vip, true); ?>>
                <label for="is_vip">این محصول VIP است</label>
            </td>
        </tr>
    </table>
    <?php
}

// ذخیره اطلاعات متاباکس خرید
function save_user_purchase_meta($post_id) {
    // بررسی nonce
    if (!isset($_POST['user_purchase_details_nonce']) || !wp_verify_nonce($_POST['user_purchase_details_nonce'], 'user_purchase_details_nonce')) {
        return;
    }
    
    // بررسی autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // بررسی دسترسی‌ها
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // ذخیره داده‌ها
    if (isset($_POST['product_title'])) {
        update_post_meta($post_id, 'product_title', sanitize_text_field($_POST['product_title']));
    }
    
    if (isset($_POST['price'])) {
        update_post_meta($post_id, 'price', sanitize_text_field($_POST['price']));
    }
    
    if (isset($_POST['duration_months'])) {
        update_post_meta($post_id, 'duration_months', intval($_POST['duration_months']));
    }
    
    if (isset($_POST['purchase_date'])) {
        update_post_meta($post_id, 'purchase_date', sanitize_text_field($_POST['purchase_date']));
    }
    
    if (isset($_POST['expiry_date'])) {
        update_post_meta($post_id, 'expiry_date', sanitize_text_field($_POST['expiry_date']));
    }
    
    if (isset($_POST['status'])) {
        update_post_meta($post_id, 'status', sanitize_text_field($_POST['status']));
    }
    
    update_post_meta($post_id, 'is_vip', isset($_POST['is_vip']) ? true : false);
}
add_action('save_post_user_purchase', 'save_user_purchase_meta');








// این کد را در فایل functions.php سایت وردپرس اضافه کنید

// ثبت endpoint برای دریافت خریدهای کاربر
add_action('rest_api_init', function() {
    register_rest_route('pcs/v1', '/user-purchases', array(
        'methods' => 'GET',
        'callback' => 'get_user_purchases',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

// تابع دریافت خریدهای کاربر
function get_user_purchases($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'not_logged_in',
            'کاربر وارد نشده است.',
            array('status' => 401)
        );
    }
    
    // یافتن همه خریدهای کاربر
    $args = array(
        'post_type' => 'user_purchase',
        'author' => $user_id,
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    
    $purchases_query = new WP_Query($args);
    $purchases = array();
    
    if ($purchases_query->have_posts()) {
        while ($purchases_query->have_posts()) {
            $purchases_query->the_post();
            $post_id = get_the_ID();
            
            $product_title = get_post_meta($post_id, 'product_title', true);
            $price = get_post_meta($post_id, 'price', true);
            $duration_months = get_post_meta($post_id, 'duration_months', true);
            $purchase_date = get_post_meta($post_id, 'purchase_date', true);
            $expiry_date = get_post_meta($post_id, 'expiry_date', true);
            $status = get_post_meta($post_id, 'status', true);
            $is_vip = get_post_meta($post_id, 'is_vip', true);
            
            // محاسبه روزهای باقیمانده
            $now = new DateTime();
            $expiry = new DateTime($expiry_date);
            $interval = $now->diff($expiry);
            $remaining_days = $interval->invert ? 0 : $interval->days;
            
            // بررسی وضعیت فعلی
            $current_status = $status;
            if ($status === 'active' && $remaining_days <= 0) {
                $current_status = 'expired';
                update_post_meta($post_id, 'status', 'expired');
            }
            
            $purchases[] = array(
                'id' => $post_id,
                'title' => $product_title,
                'date' => $purchase_date,
                'status' => $current_status,
                'remainingDays' => $remaining_days,
                'isVIP' => $is_vip ? true : false
            );
        }
        
        wp_reset_postdata();
    }
    
    return array(
        'success' => true,
        'purchases' => $purchases
    );
}








// این کد را در فایل functions.php سایت وردپرس اضافه کنید

// ثبت endpoint برای بررسی وضعیت VIP کاربر
add_action('rest_api_init', function() {
    register_rest_route('pcs/v1', '/check-vip-status', array(
        'methods' => 'GET',
        'callback' => 'check_user_vip_status',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

// تابع بررسی وضعیت VIP کاربر
function check_user_vip_status($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error(
            'not_logged_in',
            'کاربر وارد نشده است.',
            array('status' => 401)
        );
    }
    
    // یافتن اشتراک‌های VIP فعال کاربر
    $args = array(
        'post_type' => 'user_purchase',
        'author' => $user_id,
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'meta_query' => array(
            'relation' => 'AND',
            array(
                'key' => 'is_vip',
                'value' => true,
                'compare' => '='
            ),
            array(
                'key' => 'status',
                'value' => 'active',
                'compare' => '='
            ),
            array(
                'key' => 'expiry_date',
                'value' => current_time('mysql'),
                'compare' => '>',
                'type' => 'DATETIME'
            )
        )
    );
    
    $vip_query = new WP_Query($args);
    
    $has_vip = $vip_query->have_posts();
    $vip_details = array();
    
    if ($has_vip) {
        while ($vip_query->have_posts()) {
            $vip_query->the_post();
            $post_id = get_the_ID();
            
            $product_title = get_post_meta($post_id, 'product_title', true);
            $purchase_date = get_post_meta($post_id, 'purchase_date', true);
            $expiry_date = get_post_meta($post_id, 'expiry_date', true);
            
            // محاسبه روزهای باقیمانده
            $now = new DateTime();
            $expiry = new DateTime($expiry_date);
            $interval = $now->diff($expiry);
            $remaining_days = $interval->days;
            
            $vip_details[] = array(
                'id' => $post_id,
                'title' => $product_title,
                'purchase_date' => $purchase_date,
                'expiry_date' => $expiry_date,
                'remaining_days' => $remaining_days
            );
        }
        
        wp_reset_postdata();
    }
    
    return array(
        'success' => true,
        'has_vip' => $has_vip,
        'vip_details' => $vip_details
    );
}

// اضافه کردن ستون نام کاربر به لیست خریدهای کاربران
function add_user_column_to_purchase_list($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'هش تراکنش';
    $new_columns['user_info'] = 'اطلاعات کاربر';  // ستون جدید
    
    // اضافه کردن بقیه ستون‌ها
    foreach ($columns as $key => $value) {
        if ($key != 'cb' && $key != 'title') {
            $new_columns[$key] = $value;
        }
    }
    
    return $new_columns;
}
add_filter('manage_user_purchase_posts_columns', 'add_user_column_to_purchase_list');

// پر کردن محتوای ستون نام کاربر
function fill_user_info_column($column, $post_id) {
    if ($column === 'user_info') {
        $user_id = get_post_field('post_author', $post_id);
        $user = get_userdata($user_id);
        
        if ($user) {
            echo '<strong>' . esc_html($user->display_name) . '</strong><br>';
            echo '<a href="mailto:' . esc_attr($user->user_email) . '">' . esc_html($user->user_email) . '</a>';
        } else {
            echo 'کاربر یافت نشد';
        }
    }
}
add_action('manage_user_purchase_posts_custom_column', 'fill_user_info_column', 10, 2);

function make_user_column_sortable($columns) {
    $columns['user_info'] = 'author';
    return $columns;
}
add_filter('manage_edit-user_purchase_sortable_columns', 'make_user_column_sortable');









// اضافه کردن ستون نام سرویس به لیست خریدهای کاربران
function add_service_name_column_to_purchase_list($columns) {
    $new_columns = array();
    
    // حفظ ستون‌های چک‌باکس و هش تراکنش
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    
    // اضافه کردن ستون کاربر
    $new_columns['user_info'] = 'اطلاعات کاربر';
    
    // اضافه کردن ستون نام سرویس
    $new_columns['service_name'] = 'سرویس خریداری شده';
    
    // اضافه کردن بقیه ستون‌ها
    foreach ($columns as $key => $value) {
        if ($key != 'cb' && $key != 'title' && $key != 'user_info') {
            $new_columns[$key] = $value;
        }
    }
    
    return $new_columns;
}
add_filter('manage_user_purchase_posts_columns', 'add_service_name_column_to_purchase_list');

// پر کردن محتوای ستون نام سرویس
function fill_service_name_column($column, $post_id) {
    if ($column === 'service_name') {
        $product_title = get_post_meta($post_id, 'product_title', true);
        if ($product_title) {
            echo esc_html($product_title);
        } else {
            echo '-';
        }
    }
}
add_action('manage_user_purchase_posts_custom_column', 'fill_service_name_column', 10, 2);

// قابل مرتب‌سازی کردن ستون نام سرویس
function make_service_name_column_sortable($columns) {
    $columns['service_name'] = 'product_title';
    return $columns;
}
add_filter('manage_edit-user_purchase_sortable_columns', 'make_service_name_column_sortable');

// اضافه کردن امکان مرتب‌سازی بر اساس متا دیتای نام سرویس
function service_name_orderby($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    if ($query->get('post_type') === 'user_purchase' && $query->get('orderby') === 'product_title') {
        $query->set('meta_key', 'product_title');
        $query->set('orderby', 'meta_value');
    }
}
add_action('pre_get_posts', 'service_name_orderby');







add_action('rest_api_init', function () {
    register_rest_route('pcs/v1', '/update-subscription', array(
        'methods' => 'POST',
        'callback' => 'update_user_subscription',
        'permission_callback' => function () {
            return is_user_logged_in();
        }
    ));
});

function update_user_subscription($request) {
    $user_id = get_current_user_id();
    if (!$user_id) {
        return new WP_Error('unauthenticated', 'کاربر لاگین نشده است', array('status' => 401));
    }
    
    $params = $request->get_params();
    $subscription_id = isset($params['subscription_id']) ? sanitize_text_field($params['subscription_id']) : '';
    $transaction_hash = isset($params['transaction_hash']) ? sanitize_text_field($params['transaction_hash']) : '';
    $additional_days = isset($params['additional_days']) ? intval($params['additional_days']) : 0;
    $price = isset($params['price']) ? floatval($params['price']) : 0;
    
    if (empty($subscription_id) || empty($transaction_hash) || $additional_days <= 0) {
        return new WP_Error('invalid_params', 'پارامترهای نامعتبر', array('status' => 400));
    }
    
    // دریافت اشتراک‌های کاربر از متادیتا
    $subscriptions = get_user_meta($user_id, 'user_subscriptions', true);
    if (empty($subscriptions)) {
        $subscriptions = array();
    } else {
        $subscriptions = maybe_unserialize($subscriptions);
    }
    
    // پیدا کردن اشتراک مورد نظر
    $found = false;
    foreach ($subscriptions as &$subscription) {
        if ($subscription['id'] === $subscription_id) {
            // به‌روزرسانی تاریخ انقضا
            $current_expiry = isset($subscription['expiry_date']) ? strtotime($subscription['expiry_date']) : time();
            
            // اگر تاریخ انقضا گذشته، از تاریخ امروز شروع می‌کنیم
            if ($current_expiry < time()) {
                $current_expiry = time();
            }
            
            // اضافه کردن روزهای جدید
            $new_expiry = $current_expiry + ($additional_days * 24 * 60 * 60);
            $subscription['expiry_date'] = date('Y-m-d H:i:s', $new_expiry);
            $subscription['status'] = 'active';
            $subscription['last_transaction'] = $transaction_hash;
            $subscription['last_updated'] = date('Y-m-d H:i:s');
            
            $found = true;
            break;
        }
    }
    
    // اگر اشتراک پیدا نشد، خطا برمی‌گردانیم
    if (!$found) {
        return new WP_Error('subscription_not_found', 'اشتراک مورد نظر یافت نشد', array('status' => 404));
    }
    
    // ذخیره تغییرات
    update_user_meta($user_id, 'user_subscriptions', $subscriptions);
    
    // ثبت تراکنش
    $transaction_data = array(
        'user_id' => $user_id,
        'transaction_hash' => $transaction_hash,
        'amount' => $price,
        'subscription_id' => $subscription_id,
        'type' => 'renewal',
        'date' => date('Y-m-d H:i:s')
    );
    
    // ذخیره تراکنش در دیتابیس
    add_user_meta($user_id, 'subscription_transactions', $transaction_data);
    
    return array(
        'success' => true,
        'message' => 'اشتراک با موفقیت تمدید شد',
        'subscription' => $subscription
    );
}

// —————— اضافه کردن ستون تاریخ ثبت‌نام به لیست کاربران ——————

// 1. تعریف نام ستون جدید
add_filter( 'manage_users_columns', 'add_registration_date_column' );
function add_registration_date_column( $columns ) {
    $columns['registration_date'] = 'تاریخ ثبت‌نام';
    return $columns;
}

// 2. پر کردن داده برای ستون جدید
add_action( 'manage_users_custom_column', 'show_registration_date_column', 10, 3 );
function show_registration_date_column( $value, $column_name, $user_id ) {
    if ( 'registration_date' === $column_name ) {
        $user = get_userdata( $user_id );
        return date_i18n( 'Y/m/d H:i', strtotime( $user->user_registered ) );
    }
    return $value;
}

// 3. (اختیاری) امکان مرتب‌سازی بر اساس تاریخ ثبت‌نام
add_filter( 'manage_users_sortable_columns', 'make_registration_date_sortable' );
function make_registration_date_sortable( $sortable_columns ) {
    $sortable_columns['registration_date'] = 'registration_date';
    return $sortable_columns;
}

// ——————------------------------------------- add pro —————


// ورژن تصحیح شده - خرید به نام کاربر صحیح
add_action('init', function() {
    if (isset($_GET['add_vip_user']) && current_user_can('manage_options')) {
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 5;
        $product_type = isset($_GET['product']) ? $_GET['product'] : 'vip';
        
        // تعریف محصولات
// تعریف محصولات
$products = [
    'vip' => [
        'title' => 'VIP Subscription',
        'status' => 'active',
        'isVIP' => true,
        'purchase_date' => date('Y-m-d'),
        'expiry_date' => date('Y-m-d', strtotime('+12 months'))
    ],
    'dex' => [
        'title' => 'Dex Trading Course',
        'status' => 'active',
        'isVIP' => false,
        'purchase_date' => date('Y-m-d')
    ],
    'zero_to_100' => [
        'title' => '0 to 100 Crypto Course',
        'status' => 'active',
        'isVIP' => false,
        'purchase_date' => date('Y-m-d')
    ],
    'trade_pro' => [
        'title' => 'Professional Trading Course',
        'status' => 'active',
        'isVIP' => false,
        'purchase_date' => date('Y-m-d')
    ],
    'mim_coin' => [
        'title' => 'کانال میم کوین ',
        'status' => 'active',
        'isVIP' => false,
        'purchase_date' => date('Y-m-d'),
        'expiry_date' => date('Y-m-d', strtotime('+12 months'))
    ]
];
        
        $user = get_user_by('id', $user_id);
        if (!$user || !isset($products[$product_type])) {
            wp_die('خطا در پارامترها!');
        }
        
        // ذخیره در user_meta
        $existing_products = get_user_meta($user_id, 'purchased_products', true);
        $current_products = [];
        
        if (!empty($existing_products)) {
            $decoded = json_decode($existing_products, true);
            if (is_array($decoded)) {
                $current_products = $decoded;
            }
        }
        
        $current_products[] = $products[$product_type];
        $json_data = json_encode($current_products, JSON_UNESCAPED_UNICODE);
        update_user_meta($user_id, 'purchased_products', $json_data);
        
        // ذخیره در جدول posts با author صحیح
        $purchase_post = wp_insert_post([
            'post_title' => 'Purchase: ' . $products[$product_type]['title'] . ' - User: ' . $user->display_name,
            'post_content' => 'Purchase for user ID: ' . $user_id,
            'post_status' => 'publish',
            'post_type' => 'user_purchase',
            'post_author' => $user_id, // مهم: تنظیم نویسنده به کاربر مورد نظر
            'meta_input' => [
                'customer_id' => $user_id,
                'user_id' => $user_id,
                'product_title' => $products[$product_type]['title'],
                'product_status' => 'active',
                'purchase_status' => 'active',
                'is_vip' => $product_type === 'vip' ? 1 : 0,
                'purchase_date' => date('Y-m-d H:i:s'),
                'expiry_date' => isset($products[$product_type]['expiry_date']) ? $products[$product_type]['expiry_date'] : '',
                'product_data' => $json_data
            ]
        ]);
        
        // همچنین در localStorage اپ ذخیره کن
        echo '<div style="padding: 20px; font-family: Arial; direction: rtl;">';
        echo '<h2 style="color: green;">✅ خرید با موفقیت ثبت شد!</h2>';
        echo '<p><strong>کاربر:</strong> ' . $user->display_name . ' (ID: ' . $user_id . ')</p>';
        echo '<p><strong>محصول:</strong> ' . $products[$product_type]['title'] . '</p>';
        echo '<p><strong>Purchase Post ID:</strong> ' . $purchase_post . '</p>';
        echo '<p><strong>وضعیت:</strong> فعال</p>';
        
        if ($product_type === 'vip') {
            echo '<p><strong>انقضا:</strong> ' . $products[$product_type]['expiry_date'] . '</p>';
        }
        
        echo '<br><p><strong>دستور برای کاربر:</strong></p>';
        echo '<p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">کاربر باید یک بار خارج شده و مجدد وارد شود تا محصول در اپ نمایش داده شود.</p>';
        echo '</div>';
        
        // اسکریپت برای بروزرسانی localStorage در اپ (اختیاری)
        echo '<script>';
        echo 'if(window.parent && window.parent.localStorage) {';
        echo '  const purchasedProducts = JSON.parse(window.parent.localStorage.getItem("purchasedProducts") || "[]");';
        echo '  purchasedProducts.push(' . $json_data . ');';
        echo '  window.parent.localStorage.setItem("purchasedProducts", JSON.stringify(purchasedProducts));';
        echo '  console.log("محصول به localStorage اضافه شد");';
        echo '}';
        echo '</script>';
        
        exit;
    }
});

// اضافه کردن endpoint برای بررسی وجود تراکنش
add_action('rest_api_init', function() {
    register_rest_route('transaction/v1', '/check', array(
        'methods' => 'POST',
        'callback' => 'check_transaction_exists',
        'permission_callback' => '__return_true'
    ));
});

function check_transaction_exists($request) {
    global $wpdb;
    $hash = $request->get_param('hash');
    
    if (empty($hash)) {
        return new WP_REST_Response([
            'exists' => false,
            'message' => 'هش تراکنش ارسال نشده'
        ], 400);
    }
    
    // بررسی وجود هش در دیتابیس
    $exists = $wpdb->get_var(
        $wpdb->prepare("SELECT hash FROM wp_transactions WHERE hash = %s", $hash)
    );
    
    return new WP_REST_Response([
        'exists' => !empty($exists),
        'message' => $exists ? 'تراکنش موجود است' : 'تراکنش موجود نیست'
    ], 200);
}


// اضافه کردن ستون نوع تراکنش به لیست خریدهای کاربران
function add_transaction_type_column_to_purchase_list($columns) {
    $new_columns = array();
    
    // حفظ ستون‌های موجود
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['user_info'] = 'اطلاعات کاربر';
    $new_columns['service_name'] = 'سرویس خریداری شده';
    $new_columns['transaction_type'] = 'نوع تراکنش'; // ستون جدید
    
    // اضافه کردن بقیه ستون‌ها
    foreach ($columns as $key => $value) {
        if (!in_array($key, ['cb', 'title', 'user_info', 'service_name'])) {
            $new_columns[$key] = $value;
        }
    }
    
    return $new_columns;
}
add_filter('manage_user_purchase_posts_columns', 'add_transaction_type_column_to_purchase_list');

// پر کردن محتوای ستون نوع تراکنش
function fill_transaction_type_column($column, $post_id) {
    if ($column === 'transaction_type') {
        $is_renewal = get_post_meta($post_id, 'is_renewal', true);
        $status = get_post_meta($post_id, 'status', true);
        
        if ($is_renewal || $status === 'renewal') {
            echo '<span style="color: #e67e22; font-weight: bold;">🔄 تمدید</span>';
        } else {
            echo '<span style="color: #27ae60; font-weight: bold;">🆕 خرید جدید</span>';
        }
    }
}
add_action('manage_user_purchase_posts_custom_column', 'fill_transaction_type_column', 10, 2);

// قابل مرتب‌سازی کردن ستون نوع تراکنش
function make_transaction_type_column_sortable($columns) {
    $columns['transaction_type'] = 'is_renewal';
    return $columns;
}
add_filter('manage_edit-user_purchase_sortable_columns', 'make_transaction_type_column_sortable');

// مدیریت مرتب‌سازی ستون نوع تراکنش
function transaction_type_orderby($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    if ($query->get('post_type') === 'user_purchase' && $query->get('orderby') === 'is_renewal') {
        $query->set('meta_key', 'is_renewal');
        $query->set('orderby', 'meta_value');
    }
}
add_action('pre_get_posts', 'transaction_type_orderby');




// اضافه کردن فیلتر نوع تراکنش
function add_transaction_type_filter_dropdown() {
    global $typenow;
    
    if ($typenow != 'user_purchase') {
        return;
    }
    
    $transaction_type = isset($_GET['transaction_type']) ? $_GET['transaction_type'] : '';
    
    $types = array(
        'new' => 'خرید جدید',
        'renewal' => 'تمدید'
    );
    
    echo '<select name="transaction_type">';
    echo '<option value="">همه تراکنش‌ها</option>';
    
    foreach ($types as $value => $label) {
        echo '<option value="' . esc_attr($value) . '" ' . selected($transaction_type, $value, false) . '>' . esc_html($label) . '</option>';
    }
    
    echo '</select>';
}
add_action('restrict_manage_posts', 'add_transaction_type_filter_dropdown');

// مدیریت فیلتر نوع تراکنش
function handle_transaction_type_filter($query) {
    global $pagenow, $typenow;
    
    if ($pagenow === 'edit.php' && $typenow === 'user_purchase' && isset($_GET['transaction_type']) && $_GET['transaction_type']) {
        if ($_GET['transaction_type'] === 'renewal') {
            $query->query_vars['meta_query'] = array(
                array(
                    'key' => 'is_renewal',
                    'value' => true,
                    'compare' => '='
                )
            );
        } elseif ($_GET['transaction_type'] === 'new') {
            $query->query_vars['meta_query'] = array(
                array(
                    'key' => 'is_renewal',
                    'compare' => 'NOT EXISTS'
                )
            );
        }
    }
}
add_action('pre_get_posts', 'handle_transaction_type_filter');




















// ثبت Custom Post Type برای درخواست‌های پرداخت سولانا
function register_solana_payment_requests_post_type() {
    register_post_type('solana_payment',
        array(
            'labels' => array(
                'name' => 'تایید پرداخت‌های سولانا',
                'singular_name' => 'درخواست پرداخت سولانا',
                'add_new' => 'افزودن درخواست جدید',
                'add_new_item' => 'افزودن درخواست پرداخت جدید',
                'edit_item' => 'بررسی درخواست پرداخت',
                'all_items' => 'همه درخواست‌ها'
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
            'menu_position' => 26,
            'menu_icon' => 'dashicons-money-alt',
            'supports' => array('title'),
            'has_archive' => false,
            'show_in_rest' => true
        )
    );
}
add_action('init', 'register_solana_payment_requests_post_type');

// اضافه کردن متاباکس برای اطلاعات درخواست پرداخت
function add_solana_payment_meta_boxes() {
    add_meta_box(
        'solana_payment_details',
        'اطلاعات درخواست پرداخت',
        'solana_payment_details_callback',
        'solana_payment',
        'normal',
        'high'
    );
    
    add_meta_box(
        'solana_payment_actions',
        'عملیات تایید/رد',
        'solana_payment_actions_callback',
        'solana_payment',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'add_solana_payment_meta_boxes');

// نمایش اطلاعات درخواست پرداخت در متاباکس
function solana_payment_details_callback($post) {
    wp_nonce_field('solana_payment_details_nonce', 'solana_payment_details_nonce');
    
    $user_id = get_post_meta($post->ID, 'user_id', true);
    $user_email = get_post_meta($post->ID, 'user_email', true);
    $user_name = get_post_meta($post->ID, 'user_name', true);
    $transaction_hash = get_post_meta($post->ID, 'transaction_hash', true);
    $product_title = get_post_meta($post->ID, 'product_title', true);
    $price = get_post_meta($post->ID, 'price', true);
    $request_date = get_post_meta($post->ID, 'request_date', true);
    $payment_status = get_post_meta($post->ID, 'payment_status', true);
    
    ?>
    <div class="solana-payment-info" style="padding: 15px; background: #f9f9f9; border-radius: 5px; margin-bottom: 15px;">
        <h3 style="margin-top: 0; color: #0073aa;">اطلاعات کاربر و درخواست</h3>
        
        <table class="form-table">
            <tr>
                <th style="width: 150px;"><strong>نام کاربر:</strong></th>
                <td><?php echo esc_html($user_name); ?></td>
            </tr>
            <tr>
                <th><strong>ایمیل کاربر:</strong></th>
                <td><?php echo esc_html($user_email); ?></td>
            </tr>
            <tr>
                <th><strong>هش تراکنش:</strong></th>
                <td style="font-family: monospace; background: #fff; padding: 5px; border-radius: 3px;">
                    <?php echo esc_html($transaction_hash); ?>
                </td>
            </tr>
            <tr>
                <th><strong>نام سرویس:</strong></th>
                <td><?php echo esc_html($product_title); ?></td>
            </tr>
            <tr>
                <th><strong>قیمت:</strong></th>
                <td><?php echo esc_html($price); ?> دلار</td>
            </tr>
            <tr>
                <th><strong>تاریخ درخواست:</strong></th>
                <td><?php echo $request_date ? date_i18n('Y/m/d H:i:s', strtotime($request_date)) : '-'; ?></td>
            </tr>
            <tr>
                <th><strong>وضعیت فعلی:</strong></th>
                <td>
                    <?php 
                    $status_labels = array(
                        'pending' => '<span style="color: #f39c12;">در انتظار بررسی</span>',
                        'approved' => '<span style="color: #27ae60;">تایید شده</span>',
                        'rejected' => '<span style="color: #e74c3c;">رد شده</span>'
                    );
                    echo isset($status_labels[$payment_status]) ? $status_labels[$payment_status] : 'نامشخص';
                    ?>
                </td>
            </tr>
        </table>
    </div>
    <?php
}

// متاباکس عملیات تایید/رد
function solana_payment_actions_callback($post) {
    wp_nonce_field('solana_payment_actions_nonce', 'solana_payment_actions_nonce');
    
    $payment_status = get_post_meta($post->ID, 'payment_status', true);
    if (!$payment_status) {
        $payment_status = 'pending';
    }
    
    ?>
    <div class="solana-payment-actions">
        <h4>وضعیت درخواست:</h4>
        <select name="payment_status" id="payment_status" style="width: 100%; margin-bottom: 15px;">
            <option value="pending" <?php selected($payment_status, 'pending'); ?>>در انتظار بررسی</option>
            <option value="approved" <?php selected($payment_status, 'approved'); ?>>تایید شده</option>
            <option value="rejected" <?php selected($payment_status, 'rejected'); ?>>رد شده</option>
        </select>
        
        <div class="rejection-reason" style="margin-top: 10px; <?php echo ($payment_status == 'rejected' ? '' : 'display: none;'); ?>">
            <label for="rejection_reason"><strong>دلیل رد درخواست:</strong></label>
<textarea name="rejection_reason" id="rejection_reason" style="width: 100%; margin-top: 5px; height: 80px;">
<?php echo esc_textarea(get_post_meta($post->ID, 'rejection_reason', true)); ?>
</textarea>
        </div>
        
        <?php if ($payment_status === 'pending'): ?>
        <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
            <p style="margin: 0; color: #856404;"><strong>راهنما:</strong></p>
            <p style="margin: 5px 0 0 0; color: #856404; font-size: 12px;">
                • برای تایید پرداخت، "تایید شده" را انتخاب کنید<br>
                • برای رد پرداخت، "رد شده" را انتخاب کرده و دلیل را وارد کنید<br>
                • پس از ذخیره تغییرات، عملیات انجام خواهد شد
            </p>
        </div>
        <?php endif; ?>
    </div>
    
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            $("#payment_status").change(function() {
                if ($(this).val() === "rejected") {
                    $(".rejection-reason").show();
                } else {
                    $(".rejection-reason").hide();
                }
            });
        });
    </script>
    <?php
}

// ذخیره اطلاعات متاباکس و پردازش تایید/رد
function save_solana_payment_meta($post_id) {
    // بررسی nonce
    if (!isset($_POST['solana_payment_actions_nonce']) || 
        !wp_verify_nonce($_POST['solana_payment_actions_nonce'], 'solana_payment_actions_nonce')) {
        return;
    }
    
    // بررسی autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // بررسی دسترسی‌ها
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    if (isset($_POST['payment_status'])) {
        $new_status = sanitize_text_field($_POST['payment_status']);
        $old_status = get_post_meta($post_id, 'payment_status', true);
        
        update_post_meta($post_id, 'payment_status', $new_status);
        
        // اگر وضعیت به رد شده تغییر کرد، دلیل را ذخیره کن
        if ($new_status === 'rejected' && isset($_POST['rejection_reason'])) {
            update_post_meta($post_id, 'rejection_reason', sanitize_textarea_field($_POST['rejection_reason']));
        }
        
        // اگر وضعیت تغییر کرده، عملیات مربوطه را انجام بده
        if ($old_status !== $new_status) {
            if ($new_status === 'approved') {
                process_approved_solana_payment($post_id);
            } elseif ($new_status === 'rejected') {
                process_rejected_solana_payment($post_id);
            }
        }
    }
}
add_action('save_post_solana_payment', 'save_solana_payment_meta');

// پردازش پرداخت تایید شده
function process_approved_solana_payment($post_id) {
    $user_id = get_post_meta($post_id, 'user_id', true);
    $transaction_hash = get_post_meta($post_id, 'transaction_hash', true);
    $product_title = get_post_meta($post_id, 'product_title', true);
    $price = get_post_meta($post_id, 'price', true);
    $duration_months = get_post_meta($post_id, 'duration_months', true) ?: 1;
    
    if (!$user_id || !$transaction_hash || !$product_title) {
        return;
    }
    
    // ایجاد رکورد خرید در جدول user_purchase
    $purchase_post_id = wp_insert_post(array(
        'post_title' => $transaction_hash,
        'post_type' => 'user_purchase',
        'post_status' => 'publish',
        'post_author' => $user_id
    ));
    
    if (!is_wp_error($purchase_post_id)) {
        // ذخیره متا دیتای خرید
        update_post_meta($purchase_post_id, 'product_title', $product_title);
        update_post_meta($purchase_post_id, 'price', $price);
        update_post_meta($purchase_post_id, 'duration_months', $duration_months);
        update_post_meta($purchase_post_id, 'purchase_date', current_time('mysql'));
        update_post_meta($purchase_post_id, 'expiry_date', date('Y-m-d H:i:s', strtotime('+' . $duration_months . ' months')));
        update_post_meta($purchase_post_id, 'status', 'active');
        update_post_meta($purchase_post_id, 'payment_method', 'solana');
        
        // اگر محصول VIP است
        if (stripos($product_title, 'vip') !== false) {
            update_post_meta($purchase_post_id, 'is_vip', true);
        }
        
        // ذخیره شناسه خرید در درخواست پرداخت
        update_post_meta($post_id, 'purchase_id', $purchase_post_id);
        update_post_meta($post_id, 'processed_date', current_time('mysql'));
        
        // ذخیره تراکنش در جدول تراکنش‌ها
        global $wpdb;
        $wpdb->insert('wp_transactions', array(
            'hash' => $transaction_hash,
            'amount' => $price,
            'wallet_address' => 'H8Ms4Ls4FxFiSpDsNwALxsDQtoboH4TvYJ5NPLDkWvyN',
            'type' => 'SOLANA'
        ));
        
        // ارسال اطلاعیه موفقیت به کاربر (اختیاری)
        send_approval_notification_to_user($user_id, $product_title);
    }
}

// پردازش پرداخت رد شده
function process_rejected_solana_payment($post_id) {
    $user_id = get_post_meta($post_id, 'user_id', true);
    $product_title = get_post_meta($post_id, 'product_title', true);
    $rejection_reason = get_post_meta($post_id, 'rejection_reason', true);
    
    if ($user_id) {
        // ارسال اطلاعیه رد به کاربر (اختیاری)
        send_rejection_notification_to_user($user_id, $product_title, $rejection_reason);
    }
}

function send_approval_notification_to_user($user_id, $product_title) {
    $user = get_userdata($user_id);
    if (!$user) return false;
    
    $message = sprintf(
        "کاربر گرامی %s،\n\n🎉 پرداخت شما با موفقیت تایید شد!\n\n✅ سرویس: %s\n✅ وضعیت: فعال شده\n\n🔔 سرویس %s برای شما فعال شده است و می‌توانید از آن استفاده کنید.\n\nبا تشکر از انتخاب شما 🙏",
        $user->display_name,
        $product_title,
        $product_title
    );
    
    send_support_message_to_user($user_id, 'تایید پرداخت سولانا', $message);
}

function send_rejection_notification_to_user($user_id, $product_title, $rejection_reason) {
    $user = get_userdata($user_id);
    if (!$user) return false;
    
    $message = sprintf(
        "کاربر گرامی %s،\n\n❌ متأسفانه پرداخت شما رد شده است.\n\n📝 سرویس: %s\n📝 دلیل رد: %s\n\n🔄 لطفاً مشکل را رفع کرده و مجدداً تلاش کنید.\n\nدر صورت نیاز به راهنمایی بیشتر، در همینجا با ما بگیریددر ارتباط باشید.",
        $user->display_name,
        $product_title,
        $rejection_reason ?: 'دلیلی ذکر نشده است'
    );
    
    send_support_message_to_user($user_id, 'رد پرداخت سولانا', $message);
}

// اضافه کردن ستون‌های سفارشی به لیست درخواست‌های پرداخت
function add_solana_payment_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'هش تراکنش';
    $new_columns['user_info'] = 'کاربر';
    $new_columns['service_name'] = 'سرویس';
    $new_columns['price'] = 'قیمت';
    $new_columns['payment_status'] = 'وضعیت';
    $new_columns['date'] = $columns['date'];
    
    return $new_columns;
}
add_filter('manage_solana_payment_posts_columns', 'add_solana_payment_columns');

// پر کردن محتوای ستون‌های سفارشی
function fill_solana_payment_columns($column, $post_id) {
    switch ($column) {
        case 'user_info':
            $user_name = get_post_meta($post_id, 'user_name', true);
            $user_email = get_post_meta($post_id, 'user_email', true);
            echo '<strong>' . esc_html($user_name) . '</strong><br>';
            echo '<small>' . esc_html($user_email) . '</small>';
            break;
            
        case 'service_name':
            echo esc_html(get_post_meta($post_id, 'product_title', true));
            break;
            
        case 'price':
            echo esc_html(get_post_meta($post_id, 'price', true)) . ' $';
            break;
            
        case 'payment_status':
            $status = get_post_meta($post_id, 'payment_status', true);
            $status_labels = array(
                'pending' => '<span style="color: #f39c12;">در انتظار بررسی</span>',
                'approved' => '<span style="color: #27ae60;">تایید شده</span>',
                'rejected' => '<span style="color: #e74c3c;">رد شده</span>'
            );
            echo isset($status_labels[$status]) ? $status_labels[$status] : 'نامشخص';
            break;
    }
}
add_action('manage_solana_payment_posts_custom_column', 'fill_solana_payment_columns', 10, 2);

// ثبت endpoint برای ارسال درخواست پرداخت سولانا
add_action('rest_api_init', function() {
    register_rest_route('pcs/v1', '/submit-solana-payment', array(
        'methods' => 'POST',
        'callback' => 'submit_solana_payment_request',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

// تابع دریافت و ذخیره درخواست پرداخت سولانا
function submit_solana_payment_request($request) {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error('not_logged_in', 'کاربر وارد نشده است.', array('status' => 401));
    }
    
    $parameters = $request->get_params();
    
    // بررسی پارامترهای ضروری
    if (empty($parameters['transaction_hash']) || empty($parameters['product_title'])) {
        return new WP_Error('missing_parameters', 'اطلاعات ناقص است.', array('status' => 400));
    }
    
    $transaction_hash = sanitize_text_field($parameters['transaction_hash']);
    $product_title = sanitize_text_field($parameters['product_title']);
    $price = isset($parameters['price']) ? sanitize_text_field($parameters['price']) : '';
    $duration_months = isset($parameters['duration_months']) ? intval($parameters['duration_months']) : 1;
    
    // دریافت اطلاعات کاربر
    $user = get_userdata($user_id);
    if (!$user) {
        return new WP_Error('user_not_found', 'کاربر یافت نشد.', array('status' => 404));
    }
    
    // بررسی تکراری نبودن تراکنش
    $existing_request = get_posts(array(
        'post_type' => 'solana_payment',
        'meta_query' => array(
            array(
                'key' => 'transaction_hash',
                'value' => $transaction_hash,
                'compare' => '='
            )
        ),
        'posts_per_page' => 1
    ));
    
    if (!empty($existing_request)) {
        return new WP_Error('duplicate_transaction', 'این تراکنش قبلاً ثبت شده است.', array('status' => 400));
    }
    
    // ایجاد درخواست پرداخت جدید
    $post_id = wp_insert_post(array(
        'post_title' => 'درخواست پرداخت سولانا - ' . $transaction_hash,
        'post_type' => 'solana_payment',
        'post_status' => 'publish'
    ));
    
    if (is_wp_error($post_id)) {
        return new WP_Error('save_error', 'خطا در ذخیره درخواست: ' . $post_id->get_error_message(), array('status' => 500));
    }
    
    // ذخیره متا دیتا
    update_post_meta($post_id, 'user_id', $user_id);
    update_post_meta($post_id, 'user_name', $user->display_name);
    update_post_meta($post_id, 'user_email', $user->user_email);
    update_post_meta($post_id, 'transaction_hash', $transaction_hash);
    update_post_meta($post_id, 'product_title', $product_title);
    update_post_meta($post_id, 'price', $price);
    update_post_meta($post_id, 'duration_months', $duration_months);
    update_post_meta($post_id, 'request_date', current_time('mysql'));
    update_post_meta($post_id, 'payment_status', 'pending');
    
    return array(
        'success' => true,
        'message' => 'درخواست پرداخت شما ثبت شد و منتظر بررسی است.',
        'request_id' => $post_id
    );
}


function send_support_message_to_user($user_id, $subject, $message) {
    global $wpdb;
    $table_tickets = $wpdb->prefix . 'css_support_tickets';
    $table_messages = $wpdb->prefix . 'css_support_messages';
    
    // جستجوی تیکت فعال
    $active_ticket = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_tickets WHERE user_id = %d AND status IN ('open', 'in_progress') ORDER BY last_message_at DESC LIMIT 1",
        $user_id
    ));
    
    $current_time = current_time('mysql');
    
    if ($active_ticket) {
        // اضافه کردن پیام به تیکت موجود
        $wpdb->insert($table_messages, array(
            'ticket_id' => $active_ticket->id,
            'sender_id' => 1,
            'sender_type' => 'admin',
            'message' => $message,
            'created_at' => $current_time
        ));
        
        // بروزرسانی تیکت
        $wpdb->update($table_tickets, 
            array('last_message_at' => $current_time, 'unread_user_count' => $active_ticket->unread_user_count + 1),
            array('id' => $active_ticket->id)
        );
    } else {
        // ایجاد تیکت جدید
        $wpdb->insert($table_tickets, array(
            'user_id' => $user_id,
            'title' => $subject,
            'status' => 'open',
            'unread_user_count' => 1,
            'created_at' => $current_time,
            'last_message_at' => $current_time
        ));
        
        $ticket_id = $wpdb->insert_id;
        
        $wpdb->insert($table_messages, array(
            'ticket_id' => $ticket_id,
            'sender_id' => 1,
            'sender_type' => 'admin', 
            'message' => $message,
            'created_at' => $current_time
        ));
    }
    
    return true;
}


// اضافه کردن متاباکس برای ریپلای در پست‌ها
function add_reply_meta_boxes() {
    add_meta_box(
        'post_reply_meta',
        'ریپلای به پست',
        'post_reply_meta_callback',
        'post',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'add_reply_meta_boxes');

// نمایش متاباکس ریپلای
function post_reply_meta_callback($post) {
    wp_nonce_field('post_reply_nonce', 'post_reply_nonce');
    
    $is_reply = get_post_meta($post->ID, 'is_reply', true);
    $reply_to_post_id = get_post_meta($post->ID, 'reply_to_post_id', true);
    $reply_to_preview = get_post_meta($post->ID, 'reply_to_preview', true);
    
    ?>
    <div class="reply-meta-wrapper">
        <p>
            <label for="is_reply">
                <input type="checkbox" id="is_reply" name="is_reply" value="1" <?php checked($is_reply, true); ?>>
                این پست یک ریپلای است
            </label>
        </p>
        
        <div id="reply-options" style="<?php echo $is_reply ? '' : 'display: none;'; ?>">
            <p>
                <label for="reply_to_post_id"><strong>ریپلای به پست:</strong></label>
                
                <!-- فیلد جستجو -->
                <input type="text" id="post-search" placeholder="جستجو در پست‌ها..." style="width: 100%; margin: 5px 0; padding: 5px;">
                
                <!-- سلکت باکس -->
                <select name="reply_to_post_id" id="reply_to_post_id" style="width: 100%; height: 200px;" size="8">
                    <option value="">انتخاب کنید...</option>
                </select>
                
                <div style="margin-top: 5px; font-size: 12px; color: #666;">
                    نکته: می‌توانید در باکس بالا تایپ کنید تا پست مورد نظر را جستجو کنید
                </div>
            </p>
            
            <?php if ($reply_to_preview): ?>
            <div id="selected-post-preview" style="background: #f1f1f1; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <strong>پیش‌نمایش پست انتخاب شده:</strong><br>
                <?php echo esc_html($reply_to_preview); ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        let allPosts = [];
        let selectedPostId = '<?php echo $reply_to_post_id; ?>';
        
        // بارگذاری همه پست‌ها
        function loadAllPosts() {
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'get_all_posts_for_reply',
                    nonce: '<?php echo wp_create_nonce("get_all_posts_nonce"); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        allPosts = response.data;
                        populateSelect(allPosts);
                        
                        // انتخاب پست قبلی اگر وجود داشته باشد
                        if (selectedPostId) {
                            $('#reply_to_post_id').val(selectedPostId);
                        }
                    }
                }
            });
        }
        
        // پر کردن سلکت باکس
        function populateSelect(posts) {
            var $select = $('#reply_to_post_id');
            $select.empty();
            $select.append('<option value="">انتخاب کنید...</option>');
            
            posts.forEach(function(post) {
                var optionText = post.date + ' - ' + post.title;
                if (post.category) {
                    optionText = '[' + post.category + '] ' + optionText;
                }
                $select.append('<option value="' + post.id + '">' + optionText + '</option>');
            });
            
            // انتخاب مجدد پست قبلی
            if (selectedPostId) {
                $select.val(selectedPostId);
            }
        }
        
        // جستجو در پست‌ها
        $('#post-search').on('input', function() {
            var searchTerm = $(this).val().toLowerCase();
            
            if (searchTerm === '') {
                populateSelect(allPosts);
            } else {
                var filteredPosts = allPosts.filter(function(post) {
                    return post.title.toLowerCase().includes(searchTerm) ||
                           post.content.toLowerCase().includes(searchTerm) ||
                           post.date.includes(searchTerm) ||
                           (post.category && post.category.toLowerCase().includes(searchTerm));
                });
                populateSelect(filteredPosts);
            }
        });
        
        // نمایش/مخفی کردن گزینه‌های ریپلای
        $('#is_reply').change(function() {
            if ($(this).is(':checked')) {
                $('#reply-options').show();
                if (allPosts.length === 0) {
                    loadAllPosts();
                }
            } else {
                $('#reply-options').hide();
                $('#reply_to_post_id').val('');
                $('#selected-post-preview').hide();
            }
        });
        
        // نمایش پیش‌نمایش پست انتخاب شده
        $('#reply_to_post_id').change(function() {
            var postId = $(this).val();
            selectedPostId = postId;
            
            if (postId) {
                var selectedPost = allPosts.find(function(post) {
                    return post.id == postId;
                });
                
                if (selectedPost) {
                    var previewHtml = '<strong>پیش‌نمایش پست انتخاب شده:</strong><br>' +
                                     '<strong>عنوان:</strong> ' + selectedPost.title + '<br>' +
                                     '<strong>محتوا:</strong> ' + selectedPost.content;
                    
                    $('#selected-post-preview').html(previewHtml).show();
                }
            } else {
                $('#selected-post-preview').hide();
            }
        });
        
        // بارگذاری اولیه اگر چک‌باکس فعال است
        if ($('#is_reply').is(':checked')) {
            loadAllPosts();
        }
    });
    </script>
    
    <style>
    .reply-meta-wrapper {
        padding: 10px 0;
    }
    .reply-meta-wrapper select {
        margin-top: 5px;
        font-family: 'Tahoma', sans-serif;
        direction: rtl;
    }
    .reply-meta-wrapper input[type="text"] {
        font-family: 'Tahoma', sans-serif;
        direction: rtl;
        text-align: right;
    }
    #selected-post-preview {
        max-height: 150px;
        overflow-y: auto;
        direction: rtl;
        text-align: right;
    }
    </style>
    <?php
}

// ذخیره متادیتای ریپلای
function save_reply_meta($post_id) {
    // بررسی nonce
    if (!isset($_POST['post_reply_nonce']) || !wp_verify_nonce($_POST['post_reply_nonce'], 'post_reply_nonce')) {
        return;
    }
    
    // بررسی autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // بررسی دسترسی‌ها
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // ذخیره وضعیت ریپلای
    if (isset($_POST['is_reply']) && $_POST['is_reply'] == '1') {
        update_post_meta($post_id, 'is_reply', true);
        
        if (isset($_POST['reply_to_post_id']) && !empty($_POST['reply_to_post_id'])) {
            $reply_to_id = intval($_POST['reply_to_post_id']);
            update_post_meta($post_id, 'reply_to_post_id', $reply_to_id);
            
            // دریافت اطلاعات پست مرجع
            $original_post = get_post($reply_to_id);
            if ($original_post) {
                // تمیز کردن محتوا از کدهای HTML اضافی
                $clean_content = $original_post->post_content;
                
                // حذف &nbsp; و &hellip; از ابتدا و انتها
                // حذف &nbsp; و &hellip; و &amp;hellip; از همه جای متن
$clean_content = str_replace(array('&nbsp;', '&hellip;', '&amp;hellip;', '...'), '', $clean_content);

// حذف فاصله‌های اضافی از ابتدا و انتها
$clean_content = preg_replace('/^(\s)+/', '', $clean_content);
$clean_content = preg_replace('/(\s)+$/', '', $clean_content);
                
                // حذف تگ‌های HTML
                $clean_content = strip_tags($clean_content);
                
                // تمیز کردن فاصله‌های اضافی
                $clean_content = preg_replace('/\s+/', ' ', $clean_content);
                $clean_content = trim($clean_content);
                
                // برش متن به 15 کلمه
                $original_content = wp_trim_words($clean_content, 15);
                
                update_post_meta($post_id, 'reply_to_preview', $original_content);
                update_post_meta($post_id, 'reply_to_title', $original_post->post_title);
                
                // ذخیره نام نویسنده ریپلای
                $current_user = wp_get_current_user();
                update_post_meta($post_id, 'reply_author_name', $current_user->display_name);
            }
        }
    } else {
        // حذف متادیتای ریپلای اگر چک‌باکس خالی باشد
        delete_post_meta($post_id, 'is_reply');
        delete_post_meta($post_id, 'reply_to_post_id');
        delete_post_meta($post_id, 'reply_to_preview');
        delete_post_meta($post_id, 'reply_to_title');
        delete_post_meta($post_id, 'reply_author_name');
    }
}
add_action('save_post', 'save_reply_meta');

// اضافه کردن متادیتای ریپلای به REST API
add_action('rest_api_init', function() {
    register_rest_field('post', 'reply_meta', array(
        'get_callback' => function($post) {
            return array(
                'is_reply' => get_post_meta($post['id'], 'is_reply', true),
                'reply_to_post_id' => get_post_meta($post['id'], 'reply_to_post_id', true),
                'reply_author_name' => get_post_meta($post['id'], 'reply_author_name', true),
                'reply_to_preview' => get_post_meta($post['id'], 'reply_to_preview', true),
                'reply_to_title' => get_post_meta($post['id'], 'reply_to_title', true)
            );
        }
    ));
});

// AJAX handler برای دریافت همه پست‌ها
add_action('wp_ajax_get_all_posts_for_reply', 'get_all_posts_for_reply');

function get_all_posts_for_reply() {
    // بررسی nonce
    if (!wp_verify_nonce($_POST['nonce'], 'get_all_posts_nonce')) {
        wp_die('Security check failed');
    }
    
    // بررسی دسترسی
    if (!current_user_can('edit_posts')) {
        wp_die('Permission denied');
    }
    
    // دریافت همه پست‌ها
    $posts = get_posts(array(
        'post_type' => 'post',
        'posts_per_page' => -1, // همه پست‌ها
        'post_status' => 'publish',
        'orderby' => 'date',
        'order' => 'DESC'
    ));
    
    $formatted_posts = array();
    
    foreach ($posts as $post) {
        // دریافت دسته‌بندی‌ها
        $categories = get_the_category($post->ID);
        $category_names = array();
        foreach ($categories as $category) {
            $category_names[] = $category->name;
        }
        
      // تمیز کردن محتوا از کدهای HTML
$clean_content = $post->post_content;

// حذف &nbsp; و &hellip; و ... از متن
$clean_content = str_replace(array('&nbsp;', '&hellip;', '...', '&amp;hellip;'), '', $clean_content);

// حذف تگ‌های HTML
$clean_content = strip_tags($clean_content);

// حذف فاصله‌های اضافی از ابتدا و انتها
$clean_content = trim($clean_content);

// حذف فاصله‌های مضاعف
$clean_content = preg_replace('/\s+/', ' ', $clean_content);

$formatted_posts[] = array(
    'id' => $post->ID,
    'title' => wp_trim_words($post->post_title, 10),
    'content' => wp_trim_words($clean_content, 15),
    'date' => date('Y/m/d H:i', strtotime($post->post_date)),
    'category' => implode(', ', $category_names)
);
    }
    
    wp_send_json_success($formatted_posts);
}