const mongoose = require('mongoose');

// Configuration de connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audit_db';

console.log('=== Configuration MongoDB ===');
console.log('URI de connexion:', MONGODB_URI);

async function setupMongoDB() {
  try {
    console.log('\n1. Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion MongoDB réussie');

    const db = mongoose.connection.db;
    console.log('✅ Base de données:', db.databaseName);

    console.log('\n2. Vérification des collections...');
    const collections = await db.listCollections().toArray();
    console.log('Collections existantes:', collections.map(c => c.name));

    // Vérifier si la collection actions_audit existe
    const auditCollection = db.collection('actions_audit');
    const count = await auditCollection.countDocuments();
    console.log(`\n3. Documents dans actions_audit: ${count}`);

    if (count === 0) {
      console.log('\n4. Insertion de données de test...');
      
      const testData = [
        {
          OS_USERNAME: 'datchemi',
          DBUSERNAME: 'datchemi',
          ACTION_NAME: 'SELECT',
          OBJECT_NAME: 'SEQ$',
          EVENT_TIMESTAMP: '2025-01-15T10:00:00Z',
          CLIENT_PROGRAM_NAME: 'SQL Developer',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'SYS',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'ATCHEMI',
          DBUSERNAME: 'ATCHEMI',
          ACTION_NAME: 'INSERT',
          OBJECT_NAME: 'TABLE1',
          EVENT_TIMESTAMP: '2025-01-15T11:00:00Z',
          CLIENT_PROGRAM_NAME: 'sqlplus',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'USER_SCHEMA',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'SYSTEM',
          DBUSERNAME: 'SYSTEM',
          ACTION_NAME: 'UPDATE',
          OBJECT_NAME: 'MOUVEMENT',
          EVENT_TIMESTAMP: '2025-01-15T12:00:00Z',
          CLIENT_PROGRAM_NAME: 'rwbuilder.exe',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'SYS',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'SYS',
          DBUSERNAME: 'SYS',
          ACTION_NAME: 'SELECT',
          OBJECT_NAME: 'SUM$',
          EVENT_TIMESTAMP: '2025-01-15T13:00:00Z',
          CLIENT_PROGRAM_NAME: 'SQL Developer',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'SYS',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'datchemi',
          DBUSERNAME: 'datchemi',
          ACTION_NAME: 'DELETE',
          OBJECT_NAME: 'TEMP_TABLE',
          EVENT_TIMESTAMP: '2025-01-15T14:00:00Z',
          CLIENT_PROGRAM_NAME: 'SQL Developer',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'USER_SCHEMA',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'ATCHEMI',
          DBUSERNAME: 'ATCHEMI',
          ACTION_NAME: 'CREATE',
          OBJECT_NAME: 'NEW_TABLE',
          EVENT_TIMESTAMP: '2025-01-15T15:00:00Z',
          CLIENT_PROGRAM_NAME: 'SQL Developer',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'USER_SCHEMA',
          USERHOST: '192.168.60.42'
        },
        {
          OS_USERNAME: 'SYSTEM',
          DBUSERNAME: 'SYSTEM',
          ACTION_NAME: 'DROP',
          OBJECT_NAME: 'OLD_TABLE',
          EVENT_TIMESTAMP: '2025-01-15T16:00:00Z',
          CLIENT_PROGRAM_NAME: 'sqlplus',
          TERMINAL: 'unknown',
          AUTHENTICATION_TYPE: 'DATABASE',
          OBJECT_SCHEMA: 'USER_SCHEMA',
          USERHOST: '192.168.60.42'
        }
      ];
      
      const result = await auditCollection.insertMany(testData);
      console.log(`✅ ${result.insertedCount} documents insérés`);
      
      const newCount = await auditCollection.countDocuments();
      console.log(`✅ Nouveau nombre de documents: ${newCount}`);
      
      // Afficher un échantillon
      const sample = await auditCollection.find({}).limit(1).toArray();
      console.log('\n5. Exemple de document:');
      console.log(JSON.stringify(sample[0], null, 2));
      
    } else {
      console.log('\n4. Données déjà présentes, affichage d\'un échantillon...');
      const sample = await auditCollection.find({}).limit(1).toArray();
      console.log(JSON.stringify(sample[0], null, 2));
    }

    console.log('\n✅ Configuration MongoDB terminée avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration MongoDB:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nConnexion MongoDB fermée');
  }
}

setupMongoDB(); 