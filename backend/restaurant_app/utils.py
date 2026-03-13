from rest_framework.exceptions import PermissionDenied
from django.core.mail import EmailMultiAlternatives, send_mail
from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.conf import settings
from decimal import Decimal
from restaurant_app.models import MenuItemOption


def ensure_restaurant_is_active(restaurant):
    if restaurant.status != 'active':
        raise PermissionDenied("Restaurant is inactive")
    
from decimal import Decimal
from restaurant_app.models import MenuItemOption

def calculate_menu_item_price(
    menu_item,
    quantity,
    option_ids=None
):
    """
    Pricing logic:
    - integer part → full plates
    - decimal .5 → one half plate
    """

    if option_ids is None:
        option_ids = []

    quantity = Decimal(str(quantity))

    full_count = int(quantity)
    has_half = quantity % 1 != 0

    total = Decimal('0.00')

    # full plates
    total += Decimal(menu_item.price) * full_count

    # half plate
    if has_half:
        if not menu_item.allow_half or not menu_item.half_price:
            raise ValueError("Half plate not allowed for this item")
        total += Decimal(menu_item.half_price)

    # add-ons
    for opt_id in option_ids:
        opt = MenuItemOption.objects.get(
            id=opt_id,
            item=menu_item,
            is_active=True
        )
        total += Decimal(opt.extra_price) * quantity

    return total



def send_owner_account_email(owner_name, restaurant_name, owner_email, password, login_url):
    """
    Send email to restaurant owner after account creation.
    """
    subject = "Your Restaurant Account Has Been Created"

    html_content = f"""
    <html>
     <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">

      <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:8px;">
       <h2 style="color:#2c3e50;">Welcome to Restro Platform 🍽</h2> 
       <p>Hello <strong>{owner_name}</strong>,</p>
        <p> Your restaurant <strong>{restaurant_name}</strong> has been successfully registered on the Restro Platform. </p> 
        <div style="background:#f1f1f1;padding:15px;border-radius:6px;margin:20px 0;"> 
        <p><strong>Owner Login Email:</strong> {owner_email}</p> 
        <p><strong>Password:</strong> {password}</p> 
        </div> 
        <h3 style="margin-top:25px;">🔐 Platform Login URLs</h3> 
        <div style="background:#fafafa;padding:15px;border-radius:6px;border:1px solid #eee;"> <p><strong>Owner Dashboard
        </strong><br> http://localhost:3000/owner-login</p> 
        
        <p><strong>Manager Login</strong><br> http://localhost:3000/manager-login</p> 
        <p><strong>Kitchen Staff Login</strong><br> http://localhost:3000/kitchen-login</p>
          </div> <h3 style="margin-top:25px;">⚙️ Important Setup Step</h3> <p> Before your staff can log in, you must first create their accounts from the <strong>Owner Dashboard</strong>. </p> <ol> <li>Login using the <strong>Owner Dashboard</strong> link above.</li> <li>Create accounts for your <strong>Manager</strong> and <strong>Kitchen Staff</strong>.</li> <li>Share the respective login URLs with your staff members.</li> </ol> <p> Once their accounts are created, they will be able to log in and start managing orders and kitchen operations. </p> <hr style="margin:25px 0;"> <p style="font-size:14px;color:#555;"> If you need assistance, contact our support team at <strong>{settings.EMAIL_HOST_USER}</strong> </p> <p style="font-size:14px;color:#555;"> Regards,<br> <strong>Restro Platform Team</strong> </p> </div> </body> </html>
   """
    try: 
        email = EmailMultiAlternatives( 
            subject, 
            html_content, 
            settings.DEFAULT_FROM_EMAIL,
              [owner_email] )
        email.attach_alternative(html_content, "text/html") 
        email.send() 
        print("Owner welcome email sent successfully")


    except Exception as e:
        print("Email sending failed:", str(e))


from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_restaurant_status_email(owner_name, restaurant_name, owner_email, status):
  """
    Send a professional HTML email when restaurant is activated or deactivated.
  """


  if status == "active":
    subject = "Your Restaurant Has Been Activated – Restro Platform"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;">

            <h2 style="color:#27ae60;">Restaurant Activated ✅</h2>

            <p>Hello <strong>{owner_name}</strong>,</p>

            <p>
            Great news! Your restaurant <strong>{restaurant_name}</strong> has been
            successfully <strong>activated</strong> on the Restro Platform.
            </p>

            <p>
            Customers can now browse your menu, place orders, and interact with your restaurant again.
            </p>

            <div style="background:#ecf9f1;padding:15px;border-radius:6px;margin:20px 0;">
                <p><strong>Restaurant:</strong> {restaurant_name}</p>
                <p><strong>Status:</strong> ACTIVE</p>
            </div>

            <p>
            If your restaurant was previously paused, all normal operations are now restored.
            </p>

            <hr style="margin:25px 0;">

            <p style="font-size:14px;color:#555;">
            Need help? Contact our support team at
            <strong>{settings.EMAIL_HOST_USER}</strong>
            </p>

            <p style="font-size:14px;color:#555;">
            Regards,<br>
            <strong>Restro Platform Team</strong>
            </p>

        </div>
    </body>
    </html>
    """

  else:
    subject = "Important Notice – Your Restaurant Has Been Temporarily Deactivated"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;">

            <h2 style="color:#e74c3c;">Restaurant Deactivated ⚠️</h2>

            <p>Hello <strong>{owner_name}</strong>,</p>

            <p>
            This is to inform you that your restaurant
            <strong>{restaurant_name}</strong> has been
            <strong>temporarily deactivated</strong> by the platform administrator.
            </p>

            <div style="background:#fdecea;padding:15px;border-radius:6px;margin:20px 0;">
                <p><strong>Restaurant:</strong> {restaurant_name}</p>
                <p><strong>Status:</strong> INACTIVE</p>
            </div>

            <p>
            While the restaurant is inactive:
            </p>

            <ul>
                <li>Customers will not be able to place orders.</li>
                <li>Your restaurant will not appear in active listings.</li>
                <li>Operational actions may be temporarily restricted.</li>
            </ul>

            <p>
            If you believe this change was made by mistake or need further assistance,
            please contact our support team.
            </p>

            <hr style="margin:25px 0;">

            <p style="font-size:14px;color:#555;">
            Support Email: <strong>{settings.EMAIL_HOST_USER}</strong>
            </p>

            <p style="font-size:14px;color:#555;">
            Regards,<br>
            <strong>Restro Platform Team</strong>
            </p>

        </div>
    </body>
    </html>
    """

  try:
    email = EmailMultiAlternatives(
        subject,
        "",
        settings.DEFAULT_FROM_EMAIL,
        [owner_email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()

    print("Restaurant status email sent successfully")

  except Exception as e:
    print("Restaurant status email failed:", str(e))


     