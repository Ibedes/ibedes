/**
 * Test script to verify notification fix
 * This simulates a newsletter subscription and checks if notification appears
 */

const API_BASE_URL = 'http://localhost:4322'; // Adjust to your dev server URL

async function testNewsletterNotification() {
    console.log('🧪 Testing Newsletter Notification Fix...');
    
    try {
        // Test newsletter subscription
        const testEmail = `test-${Date.now()}@example.com`;
        console.log(`📧 Testing with email: ${testEmail}`);
        
        const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                source: '/test-notification-fix'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Newsletter subscription successful');
            console.log('📊 Response:', result);
            
            // Wait a moment for the notification to be processed
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test if notification appears in admin dashboard
            console.log('🔔 Checking notifications in admin dashboard...');
            
            const notificationsResponse = await fetch(`${API_BASE_URL}/api/admin/notifications`);
            const notificationsData = await notificationsResponse.json();
            
            if (notificationsData.success) {
                const newsletterNotifications = notificationsData.notifications.filter(
                    n => n.type === 'newsletter' && n.metadata?.email === testEmail
                );
                
                if (newsletterNotifications.length > 0) {
                    console.log('🎉 SUCCESS! Notification found in admin dashboard:');
                    console.log('📋 Notification details:', newsletterNotifications[0]);
                    console.log('📈 Total unread notifications:', notificationsData.unreadCount);
                } else {
                    console.log('❌ Notification NOT found in admin dashboard');
                    console.log('📋 All notifications:', notificationsData.notifications);
                }
            } else {
                console.log('❌ Failed to fetch notifications:', notificationsData);
            }
            
        } else {
            console.log('❌ Newsletter subscription failed:', result);
        }
        
    } catch (error) {
        console.error('💥 Test failed with error:', error);
    }
}

// Run the test
testNewsletterNotification().then(() => {
    console.log('🏁 Test completed');
}).catch(console.error);