// Script d'initialisation MongoDB - Étape 3: Création des vues pour l'analyse
print('=== Étape 3: Création des vues d\'analyse ===');

// Utiliser la base de données audit_db
db = db.getSiblingDB('audit_db');

// Vue pour les statistiques d'actions par utilisateur
db.createView(
  "user_action_stats",
  "actions_audit",
  [
    {
      $group: {
        _id: "$OS_USERNAME",
        total_actions: { $sum: 1 },
        actions_by_type: {
          $push: {
            action: "$ACTION_NAME",
            object: "$OBJECT_NAME",
            timestamp: "$EVENT_TIMESTAMP"
          }
        },
        last_action: { $max: "$EVENT_TIMESTAMP" },
        first_action: { $min: "$EVENT_TIMESTAMP" }
      }
    },
    {
      $project: {
        username: "$_id",
        total_actions: 1,
        actions_by_type: 1,
        last_action: 1,
        first_action: 1,
        activity_period: {
          $dateDiff: {
            startDate: "$first_action",
            endDate: "$last_action",
            unit: "hour"
          }
        }
      }
    }
  ]
);

print('✅ Vue user_action_stats créée');

// Vue pour les actions par type
db.createView(
  "action_type_summary",
  "actions_audit",
  [
    {
      $group: {
        _id: "$ACTION_NAME",
        count: { $sum: 1 },
        users: { $addToSet: "$OS_USERNAME" },
        objects: { $addToSet: "$OBJECT_NAME" }
      }
    },
    {
      $project: {
        action_type: "$_id",
        count: 1,
        unique_users: { $size: "$users" },
        unique_objects: { $size: "$objects" },
        users: 1,
        objects: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]
);

print('✅ Vue action_type_summary créée');

// Vue pour les sessions utilisateur avec détails
db.createView(
  "user_session_details",
  "user_sessions",
  [
    {
      $lookup: {
        from: "actions_audit",
        localField: "session_id",
        foreignField: "SESSION_ID",
        as: "session_actions"
      }
    },
    {
      $project: {
        user_id: 1,
        session_id: 1,
        session_start: 1,
        session_end: 1,
        duration_hours: {
          $divide: [
            {
              $subtract: [
                { $ifNull: ["$session_end", new Date()] },
                "$session_start"
              ]
            },
            3600000
          ]
        },
        actions_count: { $size: "$session_actions" },
        status: 1,
        client_program: 1,
        ip_address: 1,
        session_actions: {
          $map: {
            input: "$session_actions",
            as: "action",
            in: {
              action_type: "$$action.ACTION_NAME",
              object: "$$action.OBJECT_NAME",
              timestamp: "$$action.EVENT_TIMESTAMP"
            }
          }
        }
      }
    }
  ]
);

print('✅ Vue user_session_details créée');

// Vue pour les alertes de sécurité
db.createView(
  "security_alerts",
  "actions_audit",
  [
    {
      $match: {
        $or: [
          { "OBJECT_SCHEMA": "SYS" },
          { "ACTION_NAME": { $in: ["DROP", "TRUNCATE", "ALTER"] } },
          { "OS_USERNAME": { $in: ["SYS", "SYSTEM"] } }
        ]
      }
    },
    {
      $project: {
        alert_type: {
          $cond: {
            if: { $eq: ["$OBJECT_SCHEMA", "SYS"] },
            then: "SYS_ACCESS",
            else: {
              $cond: {
                if: { $in: ["$ACTION_NAME", ["DROP", "TRUNCATE", "ALTER"]] },
                then: "DESTRUCTIVE_ACTION",
                else: "PRIVILEGED_USER"
              }
            }
          }
        },
        username: "$OS_USERNAME",
        action: "$ACTION_NAME",
        object: "$OBJECT_NAME",
        schema: "$OBJECT_SCHEMA",
        timestamp: "$EVENT_TIMESTAMP",
        client_program: "$CLIENT_PROGRAM_NAME",
        ip_address: "$USERHOST",
        severity: {
          $cond: {
            if: { $eq: ["$OS_USERNAME", "SYS"] },
            then: "HIGH",
            else: "MEDIUM"
          }
        }
      }
    },
    {
      $sort: { timestamp: -1 }
    }
  ]
);

print('✅ Vue security_alerts créée');

// Vue pour les statistiques horaires
db.createView(
  "hourly_activity",
  "actions_audit",
  [
    {
      $group: {
        _id: {
          hour: { $hour: "$EVENT_TIMESTAMP" },
          date: { $dateToString: { format: "%Y-%m-%d", date: "$EVENT_TIMESTAMP" } }
        },
        action_count: { $sum: 1 },
        unique_users: { $addToSet: "$OS_USERNAME" },
        actions: { $push: "$ACTION_NAME" }
      }
    },
    {
      $project: {
        date: "$_id.date",
        hour: "$_id.hour",
        action_count: 1,
        unique_users_count: { $size: "$unique_users" },
        unique_users: 1,
        most_common_action: {
          $arrayElemAt: [
            {
              $map: {
                input: { $slice: ["$actions", 1] },
                as: "action",
                in: "$$action"
              }
            },
            0
          ]
        }
      }
    },
    {
      $sort: { date: 1, hour: 1 }
    }
  ]
);

print('✅ Vue hourly_activity créée');

print('=== Étape 3 terminée ===');
print('📊 Vues créées:');
print('   - user_action_stats: Statistiques par utilisateur');
print('   - action_type_summary: Résumé par type d\'action');
print('   - user_session_details: Détails des sessions');
print('   - security_alerts: Alertes de sécurité');
print('   - hourly_activity: Activité horaire');
