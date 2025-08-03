/**
 * Test script to demonstrate session-based reservation system
 * This shows how database sessions prevent race conditions
 * 
 * To run: node test-sessions.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import reservationService from "./services/reservationService.js";

// Load environment variables
dotenv.config();

// Mock request object for logging
const mockReq = {
  body: {},
  params: {},
  query: {},
  headers: {},
  method: 'POST',
  url: '/test'
};

/**
 * Simulate a race condition scenario
 * This demonstrates how sessions prevent double bookings
 */
async function testRaceCondition() {
  console.log("🚀 Testing Session-Based Reservation System");
  console.log("============================================\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Test data
    const testReservation = {
      user_id: 999999, // Test user ID
      lab_id: "507f1f77bcf86cd799439011", // You'll need to replace with a real lab ID
      reservation_date: new Date().toISOString().split('T')[0], // Today
      slots: [{
        seat_number: 1,
        start_time: "10:00",
        end_time: "11:00"
      }],
      anonymous: false
    };

    console.log("📋 Test Scenario: Two users trying to book the same slot simultaneously");
    console.log("Expected Result: Only one should succeed, the other should fail\n");

    // Simulate two concurrent reservation attempts
    console.log("🔄 Starting concurrent reservation attempts...\n");

    const promises = [
      // First user tries to book
      reservationService.createReservationWithSession(testReservation, mockReq)
        .then(result => ({ success: true, user: "User A", result }))
        .catch(error => ({ success: false, user: "User A", error: error.message })),

      // Second user tries to book the same slot (simulate race condition)
      reservationService.createReservationWithSession(testReservation, mockReq)
        .then(result => ({ success: true, user: "User B", result }))
        .catch(error => ({ success: false, user: "User B", error: error.message }))
    ];

    // Wait for both attempts to complete
    const results = await Promise.all(promises);

    console.log("📊 Results:");
    console.log("===========");
    
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.user}: Reservation created successfully`);
      } else {
        console.log(`❌ ${result.user}: ${result.error}`);
      }
    });

    console.log("\n🎯 Analysis:");
    console.log("============");
    
    const successfulBookings = results.filter(r => r.success).length;
    if (successfulBookings === 1) {
      console.log("✅ SUCCESS: Race condition prevented! Only one booking succeeded.");
      console.log("   This proves our session-based system works correctly.");
    } else if (successfulBookings === 0) {
      console.log("⚠️  Both failed - this might be due to existing data or lab ID issues");
    } else {
      console.log("❌ FAILURE: Both bookings succeeded - race condition not prevented!");
    }

    console.log("\n🔧 Technical Details:");
    console.log("====================");
    console.log("- MongoDB sessions ensure atomic operations");
    console.log("- Conflict checking and reservation creation happen together");
    console.log("- If a conflict is detected, the entire transaction is rolled back");
    console.log("- This prevents double bookings even under high concurrency");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    // Clean up
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the test
testRaceCondition(); 