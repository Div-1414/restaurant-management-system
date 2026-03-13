from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from restaurant_app.views import HallViewSet
from .views import RestaurantPrintSettingsView
from .views import today_sales_excel,close_restaurant_day



router = DefaultRouter()

router.register(r'restaurants', views.RestaurantViewSet, basename='restaurant')
router.register(r'tables', views.TableViewSet, basename='table')  # 🔥 FIX HERE
router.register(r'menu-categories', views.MenuCategoryViewSet, basename='menu-category')
router.register(r'menu-items', views.MenuItemViewSet, basename='menu-item')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'bills', views.BillViewSet, basename='bill')
router.register(
    r'parcel-orders',
    views.ParcelOrderViewSet,
    basename='parcel-order'
)
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'halls', HallViewSet, basename='hall')
router.register(r'menu-item-options', views.MenuItemOptionViewSet, basename='menu-item-option')
router.register(
    r'parcel-bills',
    views.ParcelBillViewSet,
    basename='parcel-bill'
)
router.register(r'order-sessions', views.OrderSessionViewSet, basename='order-session')







urlpatterns = [

    # 🔥 MUST BE ABOVE ROUTER
    path(
        'restaurants/<uuid:restaurant_id>/close-day/',
        close_restaurant_day,
        name='close-restaurant-day'
    ),

    path('', include(router.urls)),

    path('auth/login/', views.login, name='login'),
    path('auth/register/', views.register, name='register'),

    path(
        'customer/menu/<uuid:restaurant_id>/<uuid:table_id>/',
        views.customer_menu,
        name='customer_menu'
    ),
    path('manager/order/', views.manager_create_order, name='manager_create_order'),

    path('customer/order/', views.create_order, name='create_order'),

    path(
        'parcel/menu/<uuid:restaurant_id>/',
        views.parcel_menu,
        name='parcel_menu'
    ),
    path(
        'parcel/create/<uuid:restaurant_id>/',
        views.create_parcel_order,
        name='create_parcel_order'
    ),

    path(
        "restaurant/print-settings/",
        RestaurantPrintSettingsView.as_view(),
        name="restaurant-print-settings"
    ),

    path(
        'reports/today-sales-excel/',
        today_sales_excel,
        name='today-sales-excel'
    ),

    path(
    'manager/active-sessions/',
    views.manager_active_sessions,
    name='manager-active-sessions'
),

   path('customer/generate-bill/', views.customer_generate_bill, name='customer_generate_bill'),

   # Kitchen Dashboard endpoints (ADD THESE)
    path('kitchen/orders/', views.kitchen_orders, name='kitchen-orders'),
    path('kitchen/orders/<uuid:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('kitchen/parcels/<uuid:parcel_id>/status/', views.update_parcel_status, name='update-parcel-status'),
    
    path('', include(router.urls)),

]
