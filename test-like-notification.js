/**
 * Test script to specifically test the like notification fix
 * This simulates a like action and checks if notification appears
 */

const API_BASE_URL = 'http://localhost:4322'; // Adjust to your dev server URL

async function testLikeNotification() {
    console.log('🧪 Testing Like Notification Fix...');
    
    try {
        // Test like notification
        const testSlug = 'seni-mengenal-diri'; // This was the article in the error
        const testTitle = 'Seni Mengenal Diri';
        console.log(`❤️ Testing like for: ${testTitle} (${testSlug})`);
        
        // Try to directly test the notification client
        const response = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'like',
                title: '❤️ Like Baru',
                message: `Artikel "${testTitle}" mendapat like`,
                metadata: {
                    articleSlug: testSlug,
                    articleTitle: testTitle,
                    userHash: `test_user_${Date.now()}`,
                    source: '/test-like-notification'
                },
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Like notification successful');
            console.log('📊 Response:', result);
            
            // Wait a moment for the notification to be processed
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test if notification appears in admin dashboard
            console.log('🔔 Checking notifications in admin dashboard...');
            
            const notificationsResponse = await fetch(`${API_BASE_URL}/api/admin/notifications`);
            const notificationsData = await notificationsResponse.json();
            
            if (notificationsData.success) {
                const likeNotifications = notificationsData.notifications.filter(
                    n => n.type === 'like' && n.metadata?.articleSlug === testSlug
                );
                
                if (likeNotifications.length > 0) {
                    console.log('🎉 SUCCESS! Like notification found in admin dashboard:');
                    console.log('📋 Notification details:', likeNotifications[0]);
                    console.log('📈 Total unread notifications:', notificationsData.unreadCount);
                } else {
                    console.log('❌ Like notification NOT found in admin dashboard');
                    console.log('📋 All notifications:', notificationsData.notifications);
                }
            } else {
                console.log('❌ Failed to fetch notifications:', notificationsData);
            }
            
        } else {
            console.log('❌ Like notification failed:', result);
        }
        
    } catch (error) {
        console.error('💥 Test failed with error:', error);
    }
}

// Run the test
testLikeNotification().then(() => {
    console.log('🏁 Test completed');
}).catch(console.error);