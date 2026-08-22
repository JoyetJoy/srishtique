import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SEO data...');

  const pages = [
    {
      pagePath: '/',
      metaTitle: 'DK Exporting - Premium Spices & Nuts',
      metaDescription: 'Shop the finest collection of premium spices, nuts, and authentic Indian flavors at DK Exporting.',
    },
    {
      pagePath: '/cart',
      metaTitle: 'Your Cart - Srishtique',
      metaDescription: 'Review items in your shopping cart before proceeding to checkout at Srishtique.',
    },
    {
      pagePath: '/wishlist',
      metaTitle: 'Your Wishlist - Srishtique',
      metaDescription: 'View all the products you have saved for later in your Srishtique wishlist.',
    },
    {
      pagePath: '/about-us',
      metaTitle: 'About Us - Srishtique',
      metaDescription: 'Learn more about DK Exporting, our journey, and our passion for premium spices and authentic flavors.',
    },
    {
      pagePath: '/contact',
      metaTitle: 'Contact Us - Srishtique',
      metaDescription: 'Get in touch with Srishtique customer support for any questions or inquiries.',
    },
    {
      pagePath: '/faq',
      metaTitle: 'FAQs - Srishtique',
      metaDescription: 'Frequently asked questions about shipping, returns, and Srishtique products.',
    },
    {
      pagePath: '/terms',
      metaTitle: 'Terms & Conditions - Srishtique',
      metaDescription: 'Read the terms and conditions for using the Srishtique website and services.',
    },
    {
      pagePath: '/return-policy',
      metaTitle: 'Return Policy - Srishtique',
      metaDescription: 'Learn about our hassle-free return and exchange policy at Srishtique.',
    },
    {
      pagePath: '/shipping-policy',
      metaTitle: 'Shipping Policy - Srishtique',
      metaDescription: 'Information about delivery times, shipping costs, and order tracking.',
    },
    {
      pagePath: '/privacy-policy',
      metaTitle: 'Privacy Policy - Srishtique',
      metaDescription: 'How we collect, use, and protect your personal information at Srishtique.',
    },
    {
      pagePath: '/guest-login',
      metaTitle: 'Guest Login - Srishtique | Continue as Guest',
      metaDescription: 'Login or continue as guest to complete your Srishtique purchase quickly with OTP mobile verification.',
    },
    {
      pagePath: '/login',
      metaTitle: 'Log In - Srishtique | Welcome Back',
      metaDescription: 'Log in to your Srishtique account to manage orders, track shipments, and access your wishlist.',
    },
    {
      pagePath: '/signup',
      metaTitle: 'Sign Up - Srishtique | Create an Account',
      metaDescription: 'Create your DK Exporting account with quick mobile OTP verification to explore our premium spices and nuts collection.',
    },
    {
      pagePath: '/forgot-password',
      metaTitle: 'Forgot Password - Srishtique | Reset Your Password',
      metaDescription: 'Reset your Srishtique account password securely using mobile OTP verification.',
    },
    {
      pagePath: '/address',
      metaTitle: 'Your Addresses - Srishtique | Delivery Address',
      metaDescription: 'Manage your saved delivery addresses for seamless checkout at Srishtique.',
    },
    {
      pagePath: '/orders',
      metaTitle: 'Your Orders - Srishtique | Order History',
      metaDescription: 'View and track your previous Srishtique orders, shipment status, and order details.',
    }
  ];

  for (const page of pages) {
    await prisma.staticPageSeo.upsert({
      where: { pagePath: page.pagePath },
      update: {
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
      create: {
        pagePath: page.pagePath,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      }
    });
    console.log(`Seeded SEO for: ${page.pagePath}`);
  }

  console.log('Finished seeding SEO data!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
