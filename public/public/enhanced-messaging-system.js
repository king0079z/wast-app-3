// Enhanced Messaging System - Real-time Communication between Drivers and Management
// Integrates with existing WebSocket system and provides comprehensive chat functionality

class EnhancedMessagingSystem {
    constructor() {
        this.currentUser = null;
        this.currentDriverId = null;
        this.messages = {};
        this.unreadCounts = {};
        this.typingTimeouts = {};
        this.messageSound = null;
        this.isMessagingExpanded = true;
        
        this.init();
    }

    init() {
        console.log('🎯 Initializing Enhanced Messaging System...');
        
        // Initialize message storage
        this.loadMessagesFromStorage();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize current user context
        this.updateCurrentUser();
        
        // Setup message sound
        this.setupMessageSound();
        
        // Initialize messaging interface
        this.initializeMessagingInterface();
        
        console.log('✅ Enhanced Messaging System initialized');
    }

    setupEventListeners() {
        // Driver message input event listeners
        const driverInput = document.getElementById('driverMessageInput');
        if (driverInput) {
            driverInput.addEventListener('input', (e) => {
                this.handleDriverMessageInput(e);
            });
            
            driverInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendDriverMessage();
                }
            });
        }

        // Admin message input event listeners
        const adminInput = document.getElementById('adminMessageInput');
        if (adminInput) {
            adminInput.addEventListener('input', (e) => {
                this.handleAdminMessageInput(e);
            });
            
            adminInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAdminMessage();
                }
            });
        }

        // Listen for storage events to sync messages across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'driverMessages') {
                this.handleStorageUpdate(e.newValue);
            }
        });

        // Listen for WebSocket messages
        if (window.webSocketManager) {
            window.webSocketManager.addEventListener('message', (data) => {
                this.handleWebSocketMessage(data);
            });
        }
    }

    setupMessageSound() {
        try {
            // Create audio context for message notifications
            this.messageSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMKJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjeCzfLPfiMK');
            this.messageSound.volume = 0.3;
        } catch (error) {
            console.warn('⚠️ Could not initialize message sound:', error);
        }
    }

    updateCurrentUser() {
        if (window.authManager) {
            this.currentUser = window.authManager.getCurrentUser();
            console.log('👤 Current user updated:', this.currentUser?.id, this.currentUser?.type);
        }
    }

    initializeMessagingInterface() {
        this.updateCurrentUser();
        
        if (this.currentUser) {
            if (this.currentUser.type === 'driver') {
                this.initializeDriverMessaging();
            } else {
                this.initializeAdminMessaging();
            }
        }
    }

    initializeDriverMessaging() {
        console.log('🚛 Initializing driver messaging interface');
        
        // Load messages for driver
        this.loadDriverMessages(this.currentUser.id);
        
        // Show messaging system
        const messagingSystem = document.getElementById('driverMessagingSystem');
        if (messagingSystem) {
            messagingSystem.style.display = 'block';
            messagingSystem.style.visibility = 'visible';
            
            // Scroll to bottom to show input area after a short delay
            setTimeout(() => {
                messagingSystem.scrollTop = messagingSystem.scrollHeight;
                console.log('🔥 Scrolled driver messaging system to bottom for input access');
            }, 500);
        }
    }

    initializeAdminMessaging() {
        console.log('👨‍💼 Initializing admin messaging interface');
        
        // Admin messaging will be initialized when driver details modal opens
        this.setupAdminMessagingForCurrentDriver();
    }

    loadMessagesFromStorage() {
        try {
            const storedMessages = localStorage.getItem('driverMessages');
            if (storedMessages) {
                this.messages = JSON.parse(storedMessages);
            }

            const storedUnreadCounts = localStorage.getItem('unreadMessageCounts');
            if (storedUnreadCounts) {
                this.unreadCounts = JSON.parse(storedUnreadCounts);
            }
        } catch (error) {
            console.error('❌ Error loading messages from storage:', error);
            this.messages = {};
            this.unreadCounts = {};
        }
    }

    saveMessagesToStorage() {
        try {
            localStorage.setItem('driverMessages', JSON.stringify(this.messages));
            localStorage.setItem('unreadMessageCounts', JSON.stringify(this.unreadCounts));
        } catch (error) {
            console.error('❌ Error saving messages to storage:', error);
        }
    }

    // ================== DRIVER MESSAGING FUNCTIONS ==================

    handleDriverMessageInput(event) {
        const input = event.target;
        const sendBtn = document.getElementById('sendMessageBtn');
        
        // Enable/disable send button based on input
        if (sendBtn) {
            sendBtn.disabled = input.value.trim().length === 0;
        }

        // Show typing indicator to admin
        this.sendTypingIndicator('driver', this.currentUser.id);
    }

    sendDriverMessage() {
        const input = document.getElementById('driverMessageInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        const messageData = {
            id: Date.now().toString(),
            sender: 'driver',
            senderName: this.currentUser.name || 'Driver',
            senderId: this.currentUser.id,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
        };

        this.addMessage(this.currentUser.id, messageData);
        this.displayDriverMessage(messageData);
        
        // Clear input
        input.value = '';
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) sendBtn.disabled = true;

        // Send via WebSocket if available
        this.sendViaWebSocket(messageData);

        // Play send sound
        this.playMessageSound();

        console.log('📤 Driver message sent:', message);
    }

    sendQuickReply(message) {
        const messageData = {
            id: Date.now().toString(),
            sender: 'driver',
            senderName: this.currentUser.name || 'Driver',
            senderId: this.currentUser.id,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'quick_reply',
            status: 'sent'
        };

        this.addMessage(this.currentUser.id, messageData);
        this.displayDriverMessage(messageData);
        
        // Send via WebSocket
        this.sendViaWebSocket(messageData);
        
        // Play send sound
        this.playMessageSound();

        console.log('⚡ Quick reply sent:', message);
    }

    sendEmergencyMessage() {
        const location = this.getCurrentLocation();
        const emergencyMessage = `🚨 EMERGENCY ALERT 🚨\n\nImmediate assistance required at my current location.\n\nLocation: ${location}\nTime: ${new Date().toLocaleString()}\n\nPlease respond ASAP.`;
        
        const messageData = {
            id: Date.now().toString(),
            sender: 'driver',
            senderName: this.currentUser.name || 'Driver',
            senderId: this.currentUser.id,
            message: emergencyMessage,
            timestamp: new Date().toISOString(),
            type: 'emergency',
            status: 'sent',
            priority: 'high'
        };

        this.addMessage(this.currentUser.id, messageData);
        this.displayDriverMessage(messageData, true);
        
        // Send via WebSocket with high priority
        this.sendViaWebSocket(messageData, true);
        
        // Play emergency sound
        this.playEmergencySound();

        // Show confirmation
        if (window.app) {
            window.app.showAlert('Emergency Alert Sent', 'Your emergency alert has been sent to management. Help is on the way.', 'error', 5000);
        }

        console.log('🚨 Emergency message sent');
    }

    loadDriverMessages(driverId) {
        const messages = this.messages[driverId] || [];
        const container = document.getElementById('messagesContainer');
        
        if (!container) return;

        // Clear existing messages except welcome message
        const welcomeMessage = container.querySelector('.welcome-message');
        container.innerHTML = '';
        
        if (messages.length === 0) {
            if (welcomeMessage) {
                container.appendChild(welcomeMessage);
            }
        } else {
            messages.forEach(message => {
                this.displayDriverMessage(message, false);
            });
            this.scrollToBottom(container);
        }

        // Mark messages as read
        this.markMessagesAsRead(driverId, 'driver');
    }

    displayDriverMessage(messageData, scroll = true) {
        console.log('🔥 displayDriverMessage called with:', messageData);
        
        const container = document.getElementById('messagesContainer');
        if (!container) {
            console.error('❌ messagesContainer not found!');
            return;
        }
        
        console.log('✅ messagesContainer found, displaying message');

        // Remove welcome message if it exists
        const welcomeMessage = container.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
            console.log('✅ Welcome message removed');
        }

        const messageElement = this.createMessageBubble(messageData);
        container.appendChild(messageElement);
        console.log('✅ Message bubble added to container');

        if (scroll) {
            this.scrollToBottom(container);
            console.log('✅ Scrolled to bottom');
        }
        
        // Make sure the messaging system is visible and scrollable to input
        const messagingSystem = document.getElementById('driverMessagingSystem');
        if (messagingSystem) {
            if (messagingSystem.style.display === 'none') {
                messagingSystem.style.display = 'block';
            }
            
            // Ensure input area is accessible after message display
            setTimeout(() => {
                const inputContainer = messagingSystem.querySelector('.message-input-container');
                if (inputContainer) {
                    // Scroll to bottom of main container to show input
                    messagingSystem.scrollTop = messagingSystem.scrollHeight;
                    console.log('✅ Ensured input area is accessible after message display');
                }
            }, 100);
            console.log('✅ Made messaging system visible');
        }
    }

    // ================== ADMIN MESSAGING FUNCTIONS ==================

    setupAdminMessagingForCurrentDriver() {
        // This will be called when opening driver details modal
        if (this.currentDriverId) {
            this.loadAdminMessages(this.currentDriverId);
        }
    }

    setCurrentDriverForAdmin(driverId) {
        this.currentDriverId = driverId;
        console.log('👨‍💼 Admin messaging set for driver:', driverId);
        
        // Load messages for this driver
        this.loadAdminMessages(driverId);
        
        // Update UI elements
        this.updateAdminDriverInfo(driverId);
    }

    handleAdminMessageInput(event) {
        const input = event.target;
        const sendBtn = document.getElementById('adminSendBtn');
        
        // Enable/disable send button
        if (sendBtn) {
            sendBtn.disabled = input.value.trim().length === 0;
        }

        // Show typing indicator to driver
        this.sendTypingIndicator('admin', this.currentDriverId);
    }

    sendAdminMessage() {
        console.log('🔥 sendAdminMessage() called');
        console.log('🔥 currentDriverId:', this.currentDriverId);
        
        const input = document.getElementById('adminMessageInput');
        console.log('🔥 admin input element:', input);
        console.log('🔥 admin input value:', input?.value);
        
        if (!input || !input.value.trim() || !this.currentDriverId) {
            console.log('🔥 Admin message validation failed:', {
                hasInput: !!input,
                hasValue: !!input?.value?.trim(),
                hasDriverId: !!this.currentDriverId
            });
            return;
        }

        const message = input.value.trim();
        const messageData = {
            id: Date.now().toString(),
            sender: 'admin',
            senderName: 'Management Team',
            senderId: 'admin',
            message: message,
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
        };

        this.addMessage(this.currentDriverId, messageData);
        this.displayAdminMessage(messageData);
        
        // Clear input
        input.value = '';
        const sendBtn = document.getElementById('adminSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        // Send via WebSocket
        this.sendViaWebSocket(messageData);

        // Play send sound
        this.playMessageSound();

        // Update statistics
        this.updateMessageStatistics();

        console.log('📤 Admin message sent to driver', this.currentDriverId, ':', message);
        console.log('🔥 Message data sent:', messageData);
    }

    sendAdminQuickMessage(message) {
        if (!this.currentDriverId) return;

        const messageData = {
            id: Date.now().toString(),
            sender: 'admin',
            senderName: 'Management Team',
            senderId: 'admin',
            message: message,
            timestamp: new Date().toISOString(),
            type: 'quick_message',
            status: 'sent'
        };

        this.addMessage(this.currentDriverId, messageData);
        this.displayAdminMessage(messageData);
        
        // Send via WebSocket
        this.sendViaWebSocket(messageData);
        
        // Play send sound
        this.playMessageSound();

        // Update statistics
        this.updateMessageStatistics();

        console.log('⚡ Admin quick message sent:', message);
    }

    loadAdminMessages(driverId) {
        const messages = this.messages[driverId] || [];
        const container = document.getElementById('adminMessagesHistory');
        
        if (!container) return;

        // Clear existing messages
        container.innerHTML = '';
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="no-messages-state">
                    <i class="fas fa-comment-dots"></i>
                    <p>No messages yet</p>
                    <small>Start a conversation with the driver</small>
                </div>
            `;
        } else {
            messages.forEach(message => {
                this.displayAdminMessage(message, false);
            });
            this.scrollToBottom(container);
        }

        // Update statistics
        this.updateMessageStatistics();

        // Mark messages as read
        this.markMessagesAsRead(driverId, 'admin');
    }

    displayAdminMessage(messageData, scroll = true) {
        console.log('🔥 displayAdminMessage called with:', messageData);
        
        const container = document.getElementById('adminMessagesHistory');
        if (!container) {
            console.error('❌ adminMessagesHistory container not found!');
            return;
        }
        
        console.log('✅ adminMessagesHistory container found');

        // Remove no-messages state if it exists
        const noMessages = container.querySelector('.no-messages-state');
        if (noMessages) {
            noMessages.remove();
            console.log('✅ Removed no-messages state from admin container');
        }

        const messageElement = this.createMessageBubble(messageData, true);
        container.appendChild(messageElement);
        console.log('✅ Admin message bubble added to container');

        if (scroll) {
            this.scrollToBottom(container);
            console.log('✅ Scrolled admin container to bottom');
        }
        
        // Ensure the modal/container is visible
        const driverDetailsModal = document.getElementById('driverDetailsModal');
        if (driverDetailsModal && driverDetailsModal.style.display === 'none') {
            console.log('⚠️ Driver details modal is not visible - admin message added but may not be seen');
        }
    }

    updateAdminDriverInfo(driverId) {
        // Update driver online status and info
        const driver = window.dataManager?.getUserById(driverId);
        if (driver && driver.type === 'driver') {
            const onlineText = document.getElementById('driverOnlineText');
            const onlineStatus = document.getElementById('driverOnlineStatus');
            const lastSeen = document.getElementById('lastSeenTime');

            if (onlineText) onlineText.textContent = `${driver.name} (${driverId})`;
            if (onlineStatus) {
                onlineStatus.className = `status-indicator ${driver.status === 'active' ? 'online' : 'offline'}`;
            }
            if (lastSeen) {
                lastSeen.textContent = `Last seen: ${this.formatTime(driver.lastUpdate)}`;
            }
        }
    }

    updateMessageStatistics() {
        if (!this.currentDriverId) return;

        const messages = this.messages[this.currentDriverId] || [];
        const totalMessages = messages.length;
        const adminMessages = messages.filter(m => m.sender === 'admin').length;
        
        // Calculate average response time (simplified)
        const avgResponseTime = this.calculateAverageResponseTime(messages);

        // Update UI elements
        const totalCount = document.getElementById('totalMessagesCount');
        const avgTime = document.getElementById('avgResponseTime');
        const callsCount = document.getElementById('totalCallsCount');

        if (totalCount) totalCount.textContent = totalMessages;
        if (avgTime) avgTime.textContent = avgResponseTime;
        if (callsCount) callsCount.textContent = '0'; // Placeholder for call tracking
    }

    calculateAverageResponseTime(messages) {
        // Simplified calculation - could be enhanced
        if (messages.length < 2) return '-';
        
        const responseTimes = [];
        for (let i = 1; i < messages.length; i++) {
            const current = new Date(messages[i].timestamp);
            const previous = new Date(messages[i-1].timestamp);
            const diff = Math.abs(current - previous) / (1000 * 60); // minutes
            if (diff < 60) { // Only count responses within an hour
                responseTimes.push(diff);
            }
        }

        if (responseTimes.length === 0) return '-';
        
        const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        return `${Math.round(avg)}m`;
    }

    // ================== SHARED MESSAGING FUNCTIONS ==================

    addMessage(driverId, messageData) {
        if (!this.messages[driverId]) {
            this.messages[driverId] = [];
        }
        
        this.messages[driverId].push(messageData);
        
        // Update unread count for the recipient
        const recipientType = messageData.sender === 'driver' ? 'admin' : 'driver';
        if (!this.unreadCounts[driverId]) {
            this.unreadCounts[driverId] = { admin: 0, driver: 0 };
        }
        this.unreadCounts[driverId][recipientType]++;
        
        this.saveMessagesToStorage();
        this.updateUnreadBadges();
    }

    createMessageBubble(messageData, isAdminView = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${messageData.sender === (isAdminView ? 'admin' : 'driver') ? 'sent' : 'received'}`;
        messageDiv.setAttribute('data-message-id', messageData.id);

        const isEmergency = messageData.type === 'emergency';
        const bubbleClass = isEmergency ? 'message-content emergency' : 'message-content';

        messageDiv.innerHTML = `
            <div class="${bubbleClass}" ${isEmergency ? 'style="border: 2px solid #ef4444; background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);"' : ''}>
                ${isEmergency ? '🚨 ' : ''}${this.formatMessageContent(messageData.message)}
            </div>
            <div class="message-time">
                ${this.formatTime(messageData.timestamp)}
                <span class="message-status">
                    ${messageData.sender === (isAdminView ? 'admin' : 'driver') ? this.getMessageStatusIcon(messageData.status) : ''}
                </span>
            </div>
        `;

        return messageDiv;
    }

    formatMessageContent(message) {
        // Basic text formatting
        return message
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    getMessageStatusIcon(status) {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓';
            default: return '⏳';
        }
    }

    scrollToBottom(container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    markMessagesAsRead(driverId, userType) {
        if (this.unreadCounts[driverId]) {
            this.unreadCounts[driverId][userType] = 0;
            this.saveMessagesToStorage();
            this.updateUnreadBadges();
        }
    }

    updateUnreadBadges() {
        const currentUser = this.currentUser;
        if (!currentUser) return;

        if (currentUser.type === 'driver') {
            const badge = document.getElementById('unreadMessageCount');
            const unreadCount = this.unreadCounts[currentUser.id]?.driver || 0;
            
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }

    // ================== WEBSOCKET INTEGRATION ==================

    sendViaWebSocket(messageData, highPriority = false) {
        if (window.webSocketManager && window.webSocketManager.ws && window.webSocketManager.ws.readyState === WebSocket.OPEN) {
            // Add target driver ID for admin messages
            const enhancedMessageData = { ...messageData };
            if (messageData.sender === 'admin' && this.currentDriverId) {
                enhancedMessageData.targetDriverId = this.currentDriverId;
                console.log('🔥 Adding targetDriverId:', this.currentDriverId);
            }
            
            const wsMessage = {
                type: 'chat_message',
                data: enhancedMessageData,
                priority: highPriority ? 'high' : 'normal',
                timestamp: new Date().toISOString()
            };

            window.webSocketManager.send(wsMessage);
            console.log('📡 Message sent via WebSocket:', messageData.id, 'Target:', enhancedMessageData.targetDriverId || 'N/A');
        } else {
            console.warn('⚠️ WebSocket not available, message saved locally only');
        }
    }

    handleWebSocketMessage(data) {
        console.log('🔥 handleWebSocketMessage received:', data);
        console.log('🔥 Current user at message time:', this.currentUser);
        
        if (data.type === 'chat_message') {
            const messageData = data.data;
            console.log('🔥 Processing chat message:', messageData);
            
            // Ensure currentUser is available
            if (!this.currentUser) {
                console.log('🔥 No currentUser, updating...');
                this.updateCurrentUser();
            }
            
            if (!this.currentUser) {
                console.error('❌ Still no currentUser after update, cannot process message');
                return;
            }
            
            // Add message if it's not from the current user
            const isFromCurrentUser = this.currentUser && (
                (this.currentUser.type === 'driver' && messageData.sender === 'driver' && messageData.senderId === this.currentUser.id) ||
                (this.currentUser.type !== 'driver' && messageData.sender === 'admin')
            );

            console.log('🔥 Is message from current user?', isFromCurrentUser);

            if (!isFromCurrentUser) {
                const driverId = messageData.sender === 'driver' ? messageData.senderId : (this.currentDriverId || messageData.targetDriverId);
                console.log('🔥 Target driverId:', driverId);
                
                if (driverId) {
                    this.addMessage(driverId, messageData);
                    
                    // Display in appropriate interface
                    if (this.currentUser && this.currentUser.type === 'driver' && messageData.sender === 'admin') {
                        console.log('🔥 Displaying admin message on driver side:', messageData);
                        this.displayDriverMessage(messageData);
                        
                        // Force ensure messaging system is visible after displaying message
                        setTimeout(() => {
                            const messagingSystem = document.getElementById('driverMessagingSystem');
                            if (messagingSystem && messagingSystem.style.display === 'none') {
                                messagingSystem.style.display = 'block';
                                console.log('🔥 Forced messaging system visible after message display');
                            }
                        }, 100);
                        
                    } else if (messageData.sender === 'admin' && this.currentUser && this.currentUser.type === 'driver') {
                        // Admin message to driver
                        console.log('🔥 Displaying admin message on driver side:', messageData);
                        this.displayDriverMessage(messageData);
                        
                        // Ensure driver messaging system is visible
                        const messagingSystem = document.getElementById('driverMessagingSystem');
                        if (messagingSystem && messagingSystem.style.display === 'none') {
                            messagingSystem.style.display = 'block';
                            console.log('🔥 Made driver messaging system visible for admin message');
                        }
                        
                    } else if (messageData.sender === 'driver') {
                        // Driver message to admin - show to non-driver users (admin/management)
                        const isCurrentUserDriver = this.currentUser && this.currentUser.type === 'driver';
                        
                        console.log('🔥 Handling driver message for admin side:', messageData);
                        console.log('🔥 Current user is driver:', isCurrentUserDriver);
                        console.log('🔥 Current driver ID:', this.currentDriverId, 'Message from driver:', driverId);
                        
                        if (!isCurrentUserDriver) {
                            // This is admin/management view - show driver messages
                            const driverDetailsModal = document.getElementById('driverDetailsModal');
                            const isDriverDetailsOpen = driverDetailsModal && driverDetailsModal.style.display !== 'none';
                            
                            // Show driver messages if:
                            // 1. No specific driver selected (show all), OR
                            // 2. Message from currently selected driver, OR  
                            // 3. Driver details modal is open
                            if (!this.currentDriverId || this.currentDriverId === driverId || isDriverDetailsOpen) {
                                console.log('🔥 Displaying driver message on admin side');
                                this.displayAdminMessage(messageData);
                                
                                // Auto-set current driver if none selected
                                if (!this.currentDriverId) {
                                    this.setCurrentDriverForAdmin(driverId);
                                    console.log('🔥 Auto-set current driver to:', driverId);
                                }
                            } else {
                                console.log('🔥 Driver message filtered - from different driver');
                            }
                        } else {
                            console.log('🔥 Driver message not shown - current user is also a driver');
                        }
                    } else {
                        console.log('🔥 Message not displayed - Sender:', messageData.sender, 'Current user type:', this.currentUser?.type);
                    }
                    
                    // Play notification sound
                    this.playNotificationSound();
                    
                    // Show browser notification if page is not visible
                    if (document.hidden && messageData.type !== 'quick_reply') {
                        this.showBrowserNotification(messageData);
                    }
                } else {
                    console.error('❌ No valid driverId found for message:', messageData);
                }
            } else {
                console.log('🔥 Message ignored - sent by current user');
            }
        } else if (data.type === 'typing_indicator') {
            console.log('🔥 Processing typing indicator:', data);
            this.handleTypingIndicator(data);
        }
    }

    sendTypingIndicator(senderType, targetId) {
        if (window.webSocketManager && window.webSocketManager.ws) {
            const wsMessage = {
                type: 'typing_indicator',
                sender: senderType,
                target: targetId,
                timestamp: new Date().toISOString()
            };

            window.webSocketManager.send(wsMessage);

            // Clear existing timeout
            if (this.typingTimeouts[targetId]) {
                clearTimeout(this.typingTimeouts[targetId]);
            }

            // Set timeout to stop typing indicator
            this.typingTimeouts[targetId] = setTimeout(() => {
                const stopMessage = { ...wsMessage, action: 'stop' };
                window.webSocketManager.send(stopMessage);
            }, 3000);
        }
    }

    handleTypingIndicator(data) {
        const typingIndicator = document.getElementById('typingIndicator');
        
        // Ensure currentUser is available
        if (!this.currentUser) {
            this.updateCurrentUser();
        }
        
        if (typingIndicator && data.action !== 'stop' && this.currentUser) {
            const shouldShow = (
                (this.currentUser.type === 'driver' && data.sender === 'admin') ||
                (this.currentUser.type !== 'driver' && data.target === this.currentDriverId)
            );

            if (shouldShow) {
                typingIndicator.style.display = 'flex';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    typingIndicator.style.display = 'none';
                }, 5000);
            }
        } else if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    // ================== SOUND AND NOTIFICATIONS ==================

    playMessageSound() {
        try {
            if (this.messageSound) {
                this.messageSound.currentTime = 0;
                this.messageSound.play().catch(e => console.warn('Could not play message sound:', e));
            }
        } catch (error) {
            console.warn('Could not play message sound:', error);
        }
    }

    playNotificationSound() {
        // Different sound for incoming messages
        this.playMessageSound();
    }

    playEmergencySound() {
        // Play emergency sound multiple times
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.playMessageSound(), i * 500);
        }
    }

    showBrowserNotification(messageData) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = `New message from ${messageData.senderName}`;
            const options = {
                body: messageData.message.substring(0, 100),
                icon: '/favicon.ico',
                tag: `message-${messageData.senderId}`,
                requireInteraction: messageData.type === 'emergency'
            };

            new Notification(title, options);
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }

    // ================== UTILITY FUNCTIONS ==================

    getCurrentLocation() {
        // Try to get current location from dataManager or use placeholder
        if (window.dataManager && this.currentUser) {
            const location = window.dataManager.getDriverLocation(this.currentUser.id);
            if (location) {
                return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
            }
        }
        return 'Location unavailable';
    }

    handleStorageUpdate(newValue) {
        try {
            const updatedMessages = JSON.parse(newValue || '{}');
            this.messages = updatedMessages;
            
            // Refresh current view
            if (this.currentUser?.type === 'driver') {
                this.loadDriverMessages(this.currentUser.id);
            } else if (this.currentDriverId) {
                this.loadAdminMessages(this.currentDriverId);
            }
        } catch (error) {
            console.error('Error handling storage update:', error);
        }
    }
}

// ================== GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS ==================

// Driver Functions
function toggleMessagingSystem() {
    const content = document.getElementById('messagingContent');
    const btn = document.getElementById('toggleMessagingBtn');
    
    if (content && btn) {
        const isExpanded = !content.classList.contains('collapsed');
        content.classList.toggle('collapsed', isExpanded);
        
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }
        
        if (window.enhancedMessaging) {
            window.enhancedMessaging.isMessagingExpanded = !isExpanded;
        }
    }
}

function sendDriverMessage() {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.sendDriverMessage();
    }
}

function sendQuickReply(message) {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.sendQuickReply(message);
    }
}

function sendEmergencyMessage() {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.sendEmergencyMessage();
    }
}

function showEmojiPicker() {
    // Simple emoji picker implementation
    const emojis = ['😊', '👍', '👎', '❤️', '😢', '😡', '🆘', '✅', '❌', '⚠️'];
    const emoji = prompt('Select an emoji:\n' + emojis.join(' '));
    
    if (emoji && emojis.includes(emoji)) {
        const input = document.getElementById('driverMessageInput');
        if (input) {
            input.value += emoji;
            input.focus();
            
            // Trigger input event to enable send button
            input.dispatchEvent(new Event('input'));
        }
    }
}

function attachImage() {
    // Placeholder for image attachment
    if (window.app) {
        window.app.showAlert('Feature Coming Soon', 'Image attachment will be available in the next update.', 'info');
    }
}

function shareLocation() {
    if (window.enhancedMessaging) {
        const location = window.enhancedMessaging.getCurrentLocation();
        const input = document.getElementById('driverMessageInput');
        if (input) {
            input.value = `📍 My current location: ${location}`;
            input.focus();
            input.dispatchEvent(new Event('input'));
        }
    }
}

// Admin Functions
function sendAdminMessage() {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.sendAdminMessage();
    }
}

function sendAdminQuickMessage(message) {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.sendAdminQuickMessage(message);
    }
}

function attachFileToMessage() {
    // Placeholder for file attachment
    if (window.app) {
        window.app.showAlert('Feature Coming Soon', 'File attachment will be available in the next update.', 'info');
    }
}

function sendLocationToDriver() {
    const input = document.getElementById('adminMessageInput');
    if (input) {
        input.value = '📍 Please proceed to the marked location on your map.';
        input.focus();
        input.dispatchEvent(new Event('input'));
    }
}

function sendPriorityMessage() {
    const input = document.getElementById('adminMessageInput');
    if (input) {
        input.value = '⭐ PRIORITY: ' + (input.value || '');
        input.focus();
        input.dispatchEvent(new Event('input'));
    }
}

// Call Functions
function callDriver() {
    const currentDriverId = window.currentDriverDetailsId || (window.enhancedMessaging ? window.enhancedMessaging.currentDriverId : null);
    
    if (!currentDriverId) {
        if (window.app) {
            window.app.showAlert('No Driver Selected', 'Please select a driver first.', 'warning');
        }
        return;
    }

    // Get driver info
    const driver = window.dataManager?.getUserById(currentDriverId);
    if (!driver || driver.type !== 'driver') {
        if (window.app) {
            window.app.showAlert('Driver Not Found', 'Could not find driver information.', 'error');
        }
        return;
    }

    // Simulate call functionality
    const phoneNumber = driver.phone || '+974-XXXX-XXXX';
    const confirmCall = confirm(`Call ${driver.name}?\n\nPhone: ${phoneNumber}\n\nThis will attempt to initiate a call using your device's phone app.`);
    
    if (confirmCall) {
        // Try to initiate phone call
        try {
            window.open(`tel:${phoneNumber}`, '_self');
            
            // Log call attempt
            console.log(`📞 Call initiated to driver ${driver.name} (${currentDriverId})`);
            
            // Update call statistics
            if (window.enhancedMessaging) {
                const callsCount = document.getElementById('totalCallsCount');
                if (callsCount) {
                    const current = parseInt(callsCount.textContent) || 0;
                    callsCount.textContent = current + 1;
                }
            }
            
            // Show success message
            if (window.app) {
                window.app.showAlert('Call Initiated', `Calling ${driver.name}...`, 'success');
            }
            
        } catch (error) {
            console.error('Error initiating call:', error);
            if (window.app) {
                window.app.showAlert('Call Failed', 'Could not initiate call. Please dial manually: ' + phoneNumber, 'error');
            }
        }
    }
}

function startVideoCall() {
    if (window.app) {
        window.app.showAlert('Feature Coming Soon', 'Video calling will be available in the next update.', 'info');
    }
}

// Contact Driver (alternative name for the same function)
function contactDriver() {
    callDriver();
}

// ================== INITIALIZATION ==================

// Initialize Enhanced Messaging System when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other systems to initialize
    setTimeout(() => {
        window.enhancedMessaging = new EnhancedMessagingSystem();
        
        // Request notification permissions
        window.enhancedMessaging.requestNotificationPermission();
        
        console.log('✅ Enhanced Messaging System ready');
    }, 1000);
});

// Update messaging system when user changes
window.addEventListener('userChanged', function(event) {
    if (window.enhancedMessaging) {
        window.enhancedMessaging.updateCurrentUser();
        window.enhancedMessaging.initializeMessagingInterface();
    }
});

// Handle driver details modal opening
window.addEventListener('driverDetailsOpened', function(event) {
    console.log('🔥 driverDetailsOpened event received:', event);
    if (window.enhancedMessaging && event.detail && event.detail.driverId) {
        console.log('🔥 Setting current driver for admin:', event.detail.driverId);
        window.enhancedMessaging.setCurrentDriverForAdmin(event.detail.driverId);
    }
});

// Global function to set driver for messaging (fallback)
window.setDriverForMessaging = function(driverId) {
    console.log('🔥 setDriverForMessaging called with:', driverId);
    if (window.enhancedMessaging) {
        window.enhancedMessaging.setCurrentDriverForAdmin(driverId);
    } else {
        console.warn('⚠️ Enhanced messaging system not available');
    }
};

// Global debug function to test messaging system
window.debugMessagingSystem = function() {
    console.log('🔧 MESSAGING SYSTEM DEBUG INFO:');
    console.log('  - enhancedMessaging exists:', !!window.enhancedMessaging);
    console.log('  - webSocketManager exists:', !!window.webSocketManager);
    console.log('  - authManager exists:', !!window.authManager);
    
    if (window.enhancedMessaging) {
        console.log('  - currentUser:', window.enhancedMessaging.currentUser);
        console.log('  - currentDriverId:', window.enhancedMessaging.currentDriverId);
        console.log('  - messages:', window.enhancedMessaging.messages);
    }
    
    // Test DOM elements
    const driverMessaging = document.getElementById('driverMessagingSystem');
    const messagesContainer = document.getElementById('messagesContainer');
    const adminMessagesHistory = document.getElementById('adminMessagesHistory');
    
    console.log('  - driverMessagingSystem element:', !!driverMessaging, driverMessaging?.style.display);
    console.log('  - messagesContainer element:', !!messagesContainer);
    console.log('  - adminMessagesHistory element:', !!adminMessagesHistory);
    
    if (window.webSocketManager?.ws) {
        console.log('  - WebSocket status:', window.webSocketManager.ws.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED');
    }
};

// Global function to force show driver messaging system
window.forceShowDriverMessaging = function() {
    console.log('🔧 Forcing driver messaging system to show...');
    const messagingSystem = document.getElementById('driverMessagingSystem');
    if (messagingSystem) {
        messagingSystem.style.display = 'block';
        messagingSystem.style.visibility = 'visible';
        console.log('✅ Driver messaging system forced visible');
        
        // Auto-scroll to input area
        setTimeout(() => {
            messagingSystem.scrollTop = messagingSystem.scrollHeight;
            console.log('✅ Scrolled to bottom after showing');
        }, 100);
    } else {
        console.error('❌ Driver messaging system not found!');
    }
};

// Global function to scroll to message input area
window.scrollToMessageInput = function() {
    console.log('🔧 Scrolling to message input...');
    const messagingSystem = document.getElementById('driverMessagingSystem');
    if (messagingSystem) {
        messagingSystem.scrollTop = messagingSystem.scrollHeight;
        console.log('✅ Scrolled to message input area');
        
        // Focus the input if available
        const input = document.getElementById('driverMessageInput');
        if (input) {
            input.focus();
            console.log('✅ Focused message input');
        }
    } else {
        console.error('❌ Driver messaging system not found');
    }
};

// Global function to set current driver for admin messaging
window.setAdminMessagingDriver = function(driverId) {
    console.log('🔧 Setting admin messaging driver to:', driverId);
    if (window.enhancedMessaging) {
        window.enhancedMessaging.setCurrentDriverForAdmin(driverId);
        console.log('✅ Admin messaging driver set to:', driverId);
    } else {
        console.error('❌ Enhanced messaging system not available');
    }
};

// Global function to test admin message reception
window.testAdminMessageReception = function() {
    console.log('🔧 Testing admin message reception...');
    if (window.enhancedMessaging) {
        const currentDriver = window.enhancedMessaging.currentDriverId;
        const currentUser = window.enhancedMessaging.currentUser;
        const driverDetailsModal = document.getElementById('driverDetailsModal');
        
        console.log('📊 Admin Message Reception Status:');
        console.log('  - Current user type:', currentUser?.type);
        console.log('  - Current driver ID:', currentDriver);
        console.log('  - Driver details modal open:', driverDetailsModal?.style.display !== 'none');
        console.log('  - Admin messages container exists:', !!document.getElementById('adminMessagesHistory'));
        console.log('  - WebSocket status:', window.webSocketManager?.ws?.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED');
        
        // Test message display with driver USR-003 as default
        const testDriverId = currentDriver || 'USR-003';
        const testMessage = {
            id: 'test-' + Date.now(),
            sender: 'driver',
            senderName: 'Test Driver',
            senderId: testDriverId,
            message: 'Test message from driver - ' + new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
        };
        
        console.log('🔧 Sending test driver message:', testMessage);
        
        // Simulate the same process as WebSocket message handling
        window.enhancedMessaging.handleWebSocketMessage({
            type: 'chat_message',
            data: testMessage
        });
        
        // Also try direct display
        if (!currentDriver) {
            console.log('🔧 Setting test driver and trying direct display...');
            window.enhancedMessaging.setCurrentDriverForAdmin(testDriverId);
            window.enhancedMessaging.displayAdminMessage(testMessage);
        }
    } else {
        console.error('❌ Enhanced messaging system not available');
    }
};

// Global function to force admin view for driver messages
window.forceAdminMessageView = function(driverId = 'USR-003') {
    console.log('🔧 Forcing admin message view for driver:', driverId);
    if (window.enhancedMessaging) {
        // Clear current user to force admin view
        window.enhancedMessaging.currentUser = null;
        
        // Set the driver for messaging
        window.enhancedMessaging.setCurrentDriverForAdmin(driverId);
        
        // Ensure driver details modal is shown
        const driverDetailsModal = document.getElementById('driverDetailsModal');
        if (driverDetailsModal) {
            driverDetailsModal.style.display = 'block';
        }
        
        console.log('✅ Admin view forced for driver:', driverId);
        
        // Test with a message
        setTimeout(() => {
            window.testAdminMessageReception();
        }, 500);
    }
};

// Global function to test bidirectional messaging
window.testBidirectionalMessaging = function() {
    console.log('🔧 Testing bidirectional messaging...');
    
    if (!window.enhancedMessaging) {
        console.error('❌ Enhanced messaging system not available');
        return;
    }
    
    const currentUser = window.enhancedMessaging.currentUser;
    console.log('📊 Current user:', currentUser);
    console.log('📊 Current driver ID:', window.enhancedMessaging.currentDriverId);
    console.log('📊 WebSocket status:', window.webSocketManager?.ws?.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED');
    
    // Test driver message (should show on admin side)
    const testDriverMessage = {
        type: 'chat_message',
        data: {
            id: 'test-driver-' + Date.now(),
            sender: 'driver',
            senderName: 'Test Driver',
            senderId: 'USR-003',
            message: '🚛 Test driver message - ' + new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
        }
    };
    
    // Test admin message (should show on driver side)
    const testAdminMessage = {
        type: 'chat_message',
        data: {
            id: 'test-admin-' + Date.now(),
            sender: 'admin',
            senderName: 'Test Admin',
            senderId: 'admin',
            message: '📱 Test admin message - ' + new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent',
            targetDriverId: 'USR-003'
        }
    };
    
    console.log('🔧 Testing driver message routing...');
    window.enhancedMessaging.handleWebSocketMessage(testDriverMessage);
    
    setTimeout(() => {
        console.log('🔧 Testing admin message routing...');
        window.enhancedMessaging.handleWebSocketMessage(testAdminMessage);
    }, 1000);
    
    // Also test with different user contexts
    setTimeout(() => {
        console.log('🔧 Testing with driver user context...');
        const originalUser = window.enhancedMessaging.currentUser;
        window.enhancedMessaging.currentUser = { id: 'USR-003', type: 'driver', name: 'Test Driver' };
        window.enhancedMessaging.handleWebSocketMessage(testAdminMessage);
        
        setTimeout(() => {
            console.log('🔧 Testing with admin user context...');
            window.enhancedMessaging.currentUser = null; // Admin view
            window.enhancedMessaging.handleWebSocketMessage(testDriverMessage);
            
            // Restore original user
            window.enhancedMessaging.currentUser = originalUser;
        }, 1000);
    }, 2000);
};

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMessagingSystem;
}
