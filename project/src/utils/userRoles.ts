// 🛡️ SYSTÈME DE GESTION DES RÔLES UTILISATEUR
// Contrôle d'accès aux fonctionnalités selon le niveau de privilèges

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

export interface UserPermissions {
  canViewTablespaces: boolean;
  canViewSystemSchemas: boolean;
  canViewAdvancedAnalytics: boolean;
  canViewSecurityData: boolean;
  canViewPerformanceMetrics: boolean;
  canExportData: boolean;
  canModifySettings: boolean;
}

// Configuration des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.USER]: {
    canViewTablespaces: false,
    canViewSystemSchemas: false,
    canViewAdvancedAnalytics: false,
    canViewSecurityData: false,
    canViewPerformanceMetrics: false,
    canExportData: false,
    canModifySettings: false
  },
  [UserRole.ADMIN]: {
    canViewTablespaces: true,
    canViewSystemSchemas: true,
    canViewAdvancedAnalytics: true,
    canViewSecurityData: true,
    canViewPerformanceMetrics: true,
    canExportData: true,
    canModifySettings: true
  },
  [UserRole.SYSTEM]: {
    canViewTablespaces: true,
    canViewSystemSchemas: true,
    canViewAdvancedAnalytics: true,
    canViewSecurityData: true,
    canViewPerformanceMetrics: true,
    canExportData: true,
    canModifySettings: true
  }
};

// Gestionnaire de rôles
export class UserRoleManager {
  private static instance: UserRoleManager;
  private currentRole: UserRole = UserRole.USER;
  private userSession: any = null;

  private constructor() {
    this.loadUserRole();
  }

  public static getInstance(): UserRoleManager {
    if (!UserRoleManager.instance) {
      UserRoleManager.instance = new UserRoleManager();
    }
    return UserRoleManager.instance;
  }

  // Charger le rôle utilisateur depuis le stockage local
  private loadUserRole(): void {
    try {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole && Object.values(UserRole).includes(savedRole as UserRole)) {
        this.currentRole = savedRole as UserRole;
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du rôle utilisateur:', error);
    }
  }

  // Définir le rôle utilisateur
  public setUserRole(role: UserRole): void {
    this.currentRole = role;
    try {
      localStorage.setItem('userRole', role);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du rôle utilisateur:', error);
    }
  }

  // Obtenir le rôle actuel
  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  // Obtenir les permissions du rôle actuel
  public getCurrentPermissions(): UserPermissions {
    return ROLE_PERMISSIONS[this.currentRole];
  }

  // Vérifier si l'utilisateur a une permission spécifique
  public hasPermission(permission: keyof UserPermissions): boolean {
    return this.getCurrentPermissions()[permission];
  }

  // Vérifier si l'utilisateur peut voir les tablespaces
  public canViewTablespaces(): boolean {
    return this.hasPermission('canViewTablespaces');
  }

  // Vérifier si l'utilisateur peut voir les schémas système
  public canViewSystemSchemas(): boolean {
    return this.hasPermission('canViewSystemSchemas');
  }

  // Vérifier si l'utilisateur peut voir les analyses avancées
  public canViewAdvancedAnalytics(): boolean {
    return this.hasPermission('canViewAdvancedAnalytics');
  }

  // Vérifier si l'utilisateur peut voir les données de sécurité
  public canViewSecurityData(): boolean {
    return this.hasPermission('canViewSecurityData');
  }

  // Vérifier si l'utilisateur peut voir les métriques de performance
  public canViewPerformanceMetrics(): boolean {
    return this.hasPermission('canViewPerformanceMetrics');
  }

  // Vérifier si l'utilisateur peut exporter des données
  public canExportData(): boolean {
    return this.hasPermission('canExportData');
  }

  // Vérifier si l'utilisateur peut modifier les paramètres
  public canModifySettings(): boolean {
    return this.hasPermission('canModifySettings');
  }

  // Définir la session utilisateur
  public setUserSession(session: any): void {
    this.userSession = session;
  }

  // Obtenir la session utilisateur
  public getUserSession(): any {
    return this.userSession;
  }

  // Déterminer automatiquement le rôle basé sur les données utilisateur
  public determineRoleFromUserData(userData: any): UserRole {
    if (!userData) return UserRole.USER;

    // Logique de détermination du rôle
    const username = userData.username || userData.DBUSERNAME || userData.dbusername;
    const schemas = userData.schemasAccessed || [];
    const actions = userData.actions || [];

    // Utilisateurs système
    if (['SYS', 'SYSTEM', 'DBA'].includes(username?.toUpperCase())) {
      return UserRole.SYSTEM;
    }

    // Administrateurs (accès aux schémas système)
    if (schemas.some((schema: string) => ['SYS', 'SYSTEM'].includes(schema.toUpperCase()))) {
      return UserRole.ADMIN;
    }

    // Actions privilégiées
    const privilegedActions = ['GRANT', 'REVOKE', 'CREATE USER', 'DROP USER', 'ALTER SYSTEM'];
    if (actions.some((action: string) => privilegedActions.includes(action.toUpperCase()))) {
      return UserRole.ADMIN;
    }

    return UserRole.USER;
  }

  // Mettre à jour le rôle basé sur les données d'audit
  public updateRoleFromAuditData(auditData: any[]): void {
    if (!auditData || auditData.length === 0) return;

    // Analyser les données d'audit pour déterminer le rôle
    const userActions = auditData.reduce((acc: any, entry: any) => {
      const username = entry.DBUSERNAME || entry.dbusername;
      if (!acc[username]) {
        acc[username] = {
          username,
          schemas: new Set(),
          actions: new Set(),
          systemAccess: false
        };
      }
      
      acc[username].schemas.add(entry.OBJECT_SCHEMA || entry.object_schema);
      acc[username].actions.add(entry.ACTION_NAME || entry.action_name);
      
      if (['SYS', 'SYSTEM'].includes(entry.OBJECT_SCHEMA || entry.object_schema)) {
        acc[username].systemAccess = true;
      }
      
      return acc;
    }, {});

    // Déterminer le rôle le plus élevé
    let highestRole = UserRole.USER;
    
    Object.values(userActions).forEach((user: any) => {
      const role = this.determineRoleFromUserData(user);
      if (role === UserRole.SYSTEM) {
        highestRole = UserRole.SYSTEM;
      } else if (role === UserRole.ADMIN && highestRole !== UserRole.SYSTEM) {
        highestRole = UserRole.ADMIN;
      }
    });

    this.setUserRole(highestRole);
  }
}

// Hook React pour utiliser le gestionnaire de rôles
export const useUserRole = () => {
  const roleManager = UserRoleManager.getInstance();
  
  return {
    currentRole: roleManager.getCurrentRole(),
    permissions: roleManager.getCurrentPermissions(),
    hasPermission: roleManager.hasPermission.bind(roleManager),
    canViewTablespaces: roleManager.canViewTablespaces.bind(roleManager),
    canViewSystemSchemas: roleManager.canViewSystemSchemas.bind(roleManager),
    canViewAdvancedAnalytics: roleManager.canViewAdvancedAnalytics.bind(roleManager),
    canViewSecurityData: roleManager.canViewSecurityData.bind(roleManager),
    canViewPerformanceMetrics: roleManager.canViewPerformanceMetrics.bind(roleManager),
    canExportData: roleManager.canExportData.bind(roleManager),
    canModifySettings: roleManager.canModifySettings.bind(roleManager),
    setUserRole: roleManager.setUserRole.bind(roleManager),
    updateRoleFromAuditData: roleManager.updateRoleFromAuditData.bind(roleManager)
  };
};

// Instance globale du gestionnaire de rôles
export const userRoleManager = UserRoleManager.getInstance();
