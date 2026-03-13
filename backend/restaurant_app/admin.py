from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Restaurant, Table, MenuCategory, MenuItem, OrderSession, Order, OrderItem, Bill,Hall,ParcelOrder,ParcelOrderItem,ParcelBill,RestaurantPrintSettings,TableGroup

class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'restaurant', 'phone')}),
    )
    list_display = ['username', 'email', 'role', 'restaurant']
    list_filter = ['role', 'restaurant']






   

admin.site.register(User, CustomUserAdmin)
admin.site.register(Restaurant)
admin.site.register(Table)
admin.site.register(MenuCategory)
admin.site.register(MenuItem)
admin.site.register(OrderSession)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Bill)
admin.site.register(Hall)
admin.site.register(ParcelOrder)
admin.site.register(ParcelOrderItem)
admin.site.register(ParcelBill)
admin.site.register(RestaurantPrintSettings)
admin.site.register(TableGroup)