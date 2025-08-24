#!/usr/bin/env python3
"""
Script de test pour vérifier la connexion Oracle
"""
import requests
import json
import sys
from typing import Dict, Any

def test_oracle_connection(host: str = "localhost", port: int = 1521, 
                          service_name: str = "ORCL", username: str = "hr", 
                          password: str = "hr", driver_mode: str = "thin") -> Dict[str, Any]:
    """Teste la connexion Oracle via l'API"""
    
    base_url = "http://localhost:8000"
    
    # Test de connexion
    print(f"🔍 Test de connexion Oracle...")
    print(f"   Hôte: {host}:{port}")
    print(f"   Service: {service_name}")
    print(f"   Utilisateur: {username}")
    print(f"   Mode: {driver_mode}")
    print()
    
    try:
        # Test de connexion simple
        response = requests.post(
            f"{base_url}/api/oracle/test-connection",
            json={
                "host": host,
                "port": port,
                "service_name": service_name,
                "username": username,
                "password": password,
                "driver_mode": driver_mode
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Test de connexion réussi!")
                print(f"   Message: {data.get('message', 'Connexion OK')}")
                
                # Test d'initialisation du pool
                print("\n🔧 Test d'initialisation du pool...")
                pool_response = requests.post(
                    f"{base_url}/api/oracle/init-pool",
                    json={
                        "host": host,
                        "port": port,
                        "service_name": service_name,
                        "username": username,
                        "password": password,
                        "driver_mode": driver_mode,
                        "min_sessions": 1,
                        "max_sessions": 5,
                        "increment": 1
                    },
                    timeout=30
                )
                
                if pool_response.status_code == 200:
                    pool_data = pool_response.json()
                    if pool_data.get("success"):
                        print("✅ Pool Oracle initialisé avec succès!")
                        return {"success": True, "message": "Connexion et pool OK"}
                    else:
                        print("⚠️  Pool non initialisé mais connexion OK")
                        return {"success": True, "message": "Connexion OK (pool non initialisé)"}
                else:
                    print("⚠️  Échec d'initialisation du pool")
                    return {"success": True, "message": "Connexion OK (pool non initialisé)"}
            else:
                print("❌ Test de connexion échoué!")
                print(f"   Erreur: {data.get('error', 'Erreur inconnue')}")
                return {"success": False, "error": data.get('error', 'Erreur inconnue')}
        else:
            print(f"❌ Erreur HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Erreur: {error_data.get('detail', error_data.get('error', 'Erreur inconnue'))}")
                return {"success": False, "error": error_data.get('detail', error_data.get('error', 'Erreur inconnue'))}
            except:
                print(f"   Erreur: {response.text}")
                return {"success": False, "error": response.text}
                
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur backend")
        print("   Assurez-vous que le serveur backend Python est démarré sur http://localhost:8000")
        return {"success": False, "error": "Serveur backend non accessible"}
    except requests.exceptions.Timeout:
        print("❌ Timeout lors de la connexion")
        return {"success": False, "error": "Timeout de connexion"}
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return {"success": False, "error": str(e)}

def main():
    """Fonction principale"""
    print("🚀 Test de connexion Oracle")
    print("=" * 50)
    
    # Paramètres par défaut
    host = "localhost"
    port = 1521
    service_name = "ORCL"
    username = "hr"
    password = "hr"
    driver_mode = "thin"
    
    # Vérifier les arguments en ligne de commande
    if len(sys.argv) > 1:
        host = sys.argv[1]
    if len(sys.argv) > 2:
        port = int(sys.argv[2])
    if len(sys.argv) > 3:
        service_name = sys.argv[3]
    if len(sys.argv) > 4:
        username = sys.argv[4]
    if len(sys.argv) > 5:
        password = sys.argv[5]
    if len(sys.argv) > 6:
        driver_mode = sys.argv[6]
    
    result = test_oracle_connection(host, port, service_name, username, password, driver_mode)
    
    print("\n" + "=" * 50)
    if result["success"]:
        print("🎉 Test terminé avec succès!")
        print(f"   Résultat: {result['message']}")
        sys.exit(0)
    else:
        print("💥 Test échoué!")
        print(f"   Erreur: {result['error']}")
        print("\n💡 Suggestions:")
        print("   - Vérifiez que Oracle est démarré")
        print("   - Vérifiez les paramètres de connexion")
        print("   - Vérifiez que le backend Python est démarré")
        print("   - Installez oracledb: pip install oracledb")
        sys.exit(1)

if __name__ == "__main__":
    main()
