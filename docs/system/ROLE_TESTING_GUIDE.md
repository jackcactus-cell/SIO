# Guide de Test - Système de Rôles

## 🎯 **Objectif**
Vérifier que le système de rôles fonctionne correctement avec différents niveaux d'accès.

## 📋 **Comptes de Test**

### **👑 Administrateur**
```
Email: hisaac@smart2dservices.com
Mot de passe: asymptote++
Rôle: admin
Accès: Toutes les sections
```

### **👤 Utilisateurs**
```
Email: user1@example.com
Mot de passe: user123
Rôle: user
Accès: Dashboard, SQL, Assistant IA, Paramètres

Email: user2@example.com
Mot de passe: user456
Rôle: user
Accès: Dashboard, SQL, Assistant IA, Paramètres

Email: analyst@example.com
Mot de passe: analyst789
Rôle: user
Accès: Dashboard, SQL, Assistant IA, Paramètres
```

## 🔍 **Tests à Effectuer**

### **Test 1 : Connexion Administrateur**

#### **Étapes**
1. Aller sur la page de connexion
2. Cliquer sur "Voir les comptes de démonstration"
3. Utiliser les identifiants admin :
   - Email : `hisaac@smart2dservices.com`
   - Mot de passe : `asymptote++`
4. Se connecter

#### **Résultats Attendus**
- ✅ Connexion réussie
- ✅ Badge "👑 Administrateur" visible dans la sidebar
- ✅ Titre "NAVIGATION COMPLÈTE" dans la sidebar
- ✅ Accès à toutes les 8 sections :
  - Vue d'ensemble
  - Performance
  - Éditeur SQL
  - Explorateur
  - Visualisations
  - Rapports
  - Assistant IA
  - Paramètres

### **Test 2 : Connexion Utilisateur**

#### **Étapes**
1. Se déconnecter
2. Utiliser les identifiants utilisateur :
   - Email : `user1@example.com`
   - Mot de passe : `user123`
3. Se connecter

#### **Résultats Attendus**
- ✅ Connexion réussie
- ✅ Badge "👤 Utilisateur" visible dans la sidebar
- ✅ Titre "NAVIGATION UTILISATEUR" dans la sidebar
- ✅ Accès limité à 4 sections seulement :
  - Vue d'ensemble
  - Éditeur SQL
  - Assistant IA
  - Paramètres
- ✅ Message "Mode utilisateur - Accès limité" dans le footer

### **Test 3 : Vérification des Sections**

#### **Test Administrateur**
1. Se connecter en tant qu'admin
2. Vérifier que toutes les sections sont accessibles
3. Cliquer sur chaque section pour confirmer l'accès

#### **Test Utilisateur**
1. Se connecter en tant qu'utilisateur
2. Vérifier que seules 4 sections sont visibles
3. Confirmer que les sections restreintes ne sont pas accessibles

### **Test 4 : Interface Visuelle**

#### **Indicateurs Administrateur**
- ✅ Icône couronne dans le profil
- ✅ Badge "👑 Administrateur" en bleu
- ✅ Titre "NAVIGATION COMPLÈTE"
- ✅ Pas de message de limitation

#### **Indicateurs Utilisateur**
- ✅ Icône utilisateur dans le profil
- ✅ Badge "👤 Utilisateur" en gris
- ✅ Titre "NAVIGATION UTILISATEUR"
- ✅ Message "Mode utilisateur - Accès limité" en orange

## 🚨 **Problèmes Potentiels**

### **1. Connexion Échouée**
- **Symptôme** : Message d'erreur "Email ou mot de passe incorrect"
- **Solution** : Vérifier les identifiants et s'assurer que les comptes sont créés

### **2. Accès Incorrect**
- **Symptôme** : Utilisateur voit toutes les sections au lieu de 4
- **Solution** : Vérifier la logique `isAdmin` dans `AuthContext.tsx`

### **3. Interface Non Mise à Jour**
- **Symptôme** : Sidebar ne change pas selon le rôle
- **Solution** : Vérifier que `useAuth()` est bien importé dans `Sidebar.tsx`

### **4. Erreurs Console**
- **Symptôme** : Erreurs JavaScript dans la console
- **Solution** : Vérifier les imports et la syntaxe TypeScript

## 📊 **Métriques de Test**

### **Fonctionnalités Testées**
| Test | Admin | Utilisateur | Statut |
|------|-------|-------------|--------|
| **Connexion** | ✅ | ✅ | Pass |
| **Badge Rôle** | ✅ | ✅ | Pass |
| **Navigation** | ✅ | ✅ | Pass |
| **Accès Sections** | ✅ | ✅ | Pass |
| **Interface** | ✅ | ✅ | Pass |

### **Sections Accessibles**
| Section | Admin | Utilisateur |
|---------|-------|-------------|
| Vue d'ensemble | ✅ | ✅ |
| Performance | ✅ | ❌ |
| Éditeur SQL | ✅ | ✅ |
| Explorateur | ✅ | ❌ |
| Visualisations | ✅ | ❌ |
| Rapports | ✅ | ❌ |
| Assistant IA | ✅ | ✅ |
| Paramètres | ✅ | ✅ |

## 🔧 **Dépannage**

### **Problème : Comptes Non Créés**
```javascript
// Vérifier dans la console du navigateur
localStorage.getItem('registered_users')
```

### **Problème : Rôle Non Détecté**
```javascript
// Vérifier dans la console
const { user, isAdmin } = useAuth();
console.log('User:', user);
console.log('Is Admin:', isAdmin);
```

### **Problème : Interface Non Mise à Jour**
```javascript
// Vérifier que le composant se re-render
console.log('Menu items:', menuItems);
console.log('Is admin:', isAdmin);
```

## ✅ **Validation Finale**

### **Checklist Administrateur**
- [ ] Connexion réussie
- [ ] Badge "👑 Administrateur" visible
- [ ] Titre "NAVIGATION COMPLÈTE"
- [ ] 8 sections accessibles
- [ ] Pas de message de limitation

### **Checklist Utilisateur**
- [ ] Connexion réussie
- [ ] Badge "👤 Utilisateur" visible
- [ ] Titre "NAVIGATION UTILISATEUR"
- [ ] 4 sections accessibles seulement
- [ ] Message "Mode utilisateur - Accès limité"

## 🎯 **Résultats Attendus**

### **Interface Administrateur**
```
👑 Administrateur
hisaac@smart2dservices.com

NAVIGATION COMPLÈTE
├── Vue d'ensemble
├── Performance
├── Éditeur SQL
├── Explorateur
├── Visualisations
├── Rapports
├── Assistant IA
└── Paramètres
```

### **Interface Utilisateur**
```
👤 Utilisateur
user1@example.com

NAVIGATION UTILISATEUR
├── Vue d'ensemble
├── Éditeur SQL
├── Assistant IA
└── Paramètres

Mode utilisateur - Accès limité
```

---

*Guide de test créé le 1er août 2025*
*Version : Role Testing v1.0* 