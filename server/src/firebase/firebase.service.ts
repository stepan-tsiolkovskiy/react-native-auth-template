import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  onModuleInit() {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
        }),
      });
    }

    this.db = admin.firestore();
    console.log('🔥 Firebase initialized');
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  // Create document
  async createDocument(collection: string, id: string, data: any) {
    try {
      await this.db.collection(collection).doc(id).set(data);
      console.log(`✅ Document created: ${collection}/${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating document:`, error);
      throw error;
    }
  }

  // Get document
  async getDocument(collection: string, id: string) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error getting document:`, error);
      throw error;
    }
  }

  // Find document by field
  async findDocumentByField(collection: string, field: string, value: any) {
    try {
      const snapshot = await this.db
        .collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error finding document:`, error);
      throw error;
    }
  }

  // Update document
  async updateDocument(collection: string, id: string, data: any) {
    try {
      await this.db.collection(collection).doc(id).update(data);
      console.log(`✅ Document updated: ${collection}/${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating document:`, error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(collection: string, id: string) {
    try {
      await this.db.collection(collection).doc(id).delete();
      console.log(`✅ Document deleted: ${collection}/${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting document:`, error);
      throw error;
    }
  }
}