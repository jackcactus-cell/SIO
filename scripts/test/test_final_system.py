#!/usr/bin/env python3
"""
Script de test final pour valider l'ensemble du système Oracle Audit
"""

import requests
import json
import time
import csv
import io
import pandas as pd
from pathlib import Path

class SystemTester:
    def __init__(self):
        self.base_urls = {
            'frontend': 'http://localhost:5173',
            'backend_node': 'http://localhost:4000',
            'backend_python': 'http://localhost:8000',
            'backend_llm': 'http://localhost:8001'
        }
        self.test_results = {}
    
    def test_service_health(self):
        """Test de santé de tous les services"""
        print("🔍 Test de santé des services...")
        
        results = {}
        
        # Test Backend LLM
        try:
            response = requests.get(f"{self.base_urls['backend_llm']}/", timeout=5)
            results['backend_llm'] = {
                'status': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else None
            }
            print(f"✅ Backend LLM: {response.status_code}")
        except Exception as e:
            results['backend_llm'] = {'status': False, 'error': str(e)}
            print(f"❌ Backend LLM: {e}")
        
        # Test Backend Python
        try:
            response = requests.get(f"{self.base_urls['backend_python']}/", timeout=5)
            results['backend_python'] = {
                'status': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else None
            }
            print(f"✅ Backend Python: {response.status_code}")
        except Exception as e:
            results['backend_python'] = {'status': False, 'error': str(e)}
            print(f"❌ Backend Python: {e}")
        
        # Test Backend Node
        try:
            response = requests.get(f"{self.base_urls['backend_node']}/", timeout=5)
            results['backend_node'] = {
                'status': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else None
            }
            print(f"✅ Backend Node: {response.status_code}")
        except Exception as e:
            results['backend_node'] = {'status': False, 'error': str(e)}
            print(f"❌ Backend Node: {e}")
        
        self.test_results['health'] = results
        return results
    
    def create_test_csv(self):
        """Créer un fichier CSV de test"""
        csv_data = [
            ['timestamp', 'os_username', 'db_username', 'action_name', 'object_name', 'object_schema', 'client_program_name', 'userhost', 'session_id'],
            ['2024-01-03 10:00:00', 'user1', 'app_user1', 'SELECT', 'EMPLOYEES', 'HR', 'SQLDeveloper', 'workstation01', '12345'],
            ['2024-01-03 10:01:00', 'user2', 'app_user2', 'INSERT', 'ORDERS', 'SALES', 'SQLPlus', 'workstation02', '12346'],
            ['2024-01-03 10:02:00', 'user1', 'app_user1', 'UPDATE', 'CUSTOMERS', 'SALES', 'Toad', 'workstation01', '12345'],
            ['2024-01-03 10:03:00', 'user3', 'app_user3', 'DELETE', 'TEMP_TABLE', 'TEMP', 'JDBC', 'server01', '12347'],
            ['2024-01-03 10:04:00', 'user2', 'app_user2', 'SELECT', 'USERS', 'SYS', 'SQLDeveloper', 'workstation02', '12346'],
            ['2024-01-03 10:05:00', 'admin', 'sys', 'CREATE INDEX', 'IDX_EMPLOYEES', 'HR', 'SQLPlus', 'adminstation', '12348'],
            ['2024-01-03 10:06:00', 'user1', 'app_user1', 'TRUNCATE TABLE', 'STAGING_DATA', 'ETL', 'JDBC', 'workstation01', '12345'],
            ['2024-01-03 10:07:00', 'batch_user', 'batch', 'SELECT', 'AUDIT_TRAIL', 'SYS', 'BatchJob', 'batchserver', '12349'],
            ['2024-01-03 10:08:00', 'user4', 'app_user4', 'SET ROLE', 'DBA_ROLE', 'SYS', 'SQLPlus', 'workstation03', '12350']
        ]
        
        csv_content = io.StringIO()
        writer = csv.writer(csv_content)
        for row in csv_data:
            writer.writerow(row)
        
        return csv_content.getvalue()
    
    def create_test_excel(self):
        """Créer un fichier Excel de test"""
        df = pd.DataFrame([
            {'timestamp': '2024-01-03 10:00:00', 'os_username': 'user1', 'action_name': 'SELECT', 'object_name': 'EMPLOYEES', 'object_schema': 'HR'},
            {'timestamp': '2024-01-03 10:01:00', 'os_username': 'user2', 'action_name': 'INSERT', 'object_name': 'ORDERS', 'object_schema': 'SALES'},
            {'timestamp': '2024-01-03 10:02:00', 'os_username': 'user1', 'action_name': 'UPDATE', 'object_name': 'CUSTOMERS', 'object_schema': 'SALES'},
        ])
        
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False, engine='openpyxl')
        excel_buffer.seek(0)
        
        return excel_buffer.getvalue()
    
    def test_csv_upload(self):
        """Test de l'upload CSV"""
        print("\n📊 Test de l'upload CSV...")
        
        try:
            csv_content = self.create_test_csv()
            
            files = {
                'file': ('test_audit.csv', csv_content, 'text/csv')
            }
            
            response = requests.post(
                f"{self.base_urls['backend_llm']}/api/upload-logs",
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload CSV réussi: {result.get('message', '')}")
                print(f"📈 Événements traités: {result.get('events_count', 0)}")
                print(f"📝 Résumé: {result.get('summary', '')[:100]}...")
                
                if result.get('suggested_questions'):
                    print(f"💡 Questions suggérées: {len(result['suggested_questions'])}")
                    for i, q in enumerate(result['suggested_questions'][:3]):
                        print(f"   {i+1}. {q}")
                
                self.test_results['csv_upload'] = {'status': True, 'result': result}
                return True
            else:
                print(f"❌ Erreur upload CSV: {response.status_code} - {response.text}")
                self.test_results['csv_upload'] = {'status': False, 'error': response.text}
                return False
                
        except Exception as e:
            print(f"❌ Exception upload CSV: {e}")
            self.test_results['csv_upload'] = {'status': False, 'error': str(e)}
            return False
    
    def test_excel_upload(self):
        """Test de l'upload Excel"""
        print("\n📈 Test de l'upload Excel...")
        
        try:
            excel_content = self.create_test_excel()
            
            files = {
                'file': ('test_audit.xlsx', excel_content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            }
            
            response = requests.post(
                f"{self.base_urls['backend_llm']}/api/upload-logs",
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload Excel réussi: {result.get('message', '')}")
                print(f"📈 Lignes traitées: {result.get('events_count', 0)}")
                print(f"📝 Type de fichier: {result.get('file_type', '')}")
                
                self.test_results['excel_upload'] = {'status': True, 'result': result}
                return True
            else:
                print(f"❌ Erreur upload Excel: {response.status_code} - {response.text}")
                self.test_results['excel_upload'] = {'status': False, 'error': response.text}
                return False
                
        except Exception as e:
            print(f"❌ Exception upload Excel: {e}")
            self.test_results['excel_upload'] = {'status': False, 'error': str(e)}
            return False
    
    def test_chatbot_questions(self):
        """Test des questions au chatbot"""
        print("\n🤖 Test du chatbot...")
        
        questions = [
            "Combien d'événements sont dans ce fichier ?",
            "Quels sont les utilisateurs les plus actifs ?",
            "Répartition des actions par type",
            "À quelle heure l'activité est-elle la plus élevée ?",
            "Quels schémas sont les plus consultés ?"
        ]
        
        results = {}
        
        for question in questions:
            try:
                response = requests.post(
                    f"{self.base_urls['backend_llm']}/api/ask-llm",
                    json={'question': question},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Question: {question}")
                    print(f"   Réponse: {result.get('answer', '')[:100]}...")
                    print(f"   Type: {result.get('type', 'text')}")
                    print(f"   Confiance: {result.get('confidence', 0):.2f}")
                    
                    if result.get('data') and result.get('columns'):
                        print(f"   Tableau: {len(result['data'])} lignes, {len(result['columns'])} colonnes")
                    
                    results[question] = {'status': True, 'result': result}
                    print()
                else:
                    print(f"❌ Erreur pour '{question}': {response.status_code}")
                    results[question] = {'status': False, 'error': response.text}
                    
            except Exception as e:
                print(f"❌ Exception pour '{question}': {e}")
                results[question] = {'status': False, 'error': str(e)}
        
        self.test_results['chatbot'] = results
        return results
    
    def test_oracle_stats(self):
        """Test des statistiques Oracle"""
        print("\n📊 Test des statistiques Oracle...")
        
        try:
            response = requests.get(f"{self.base_urls['backend_llm']}/api/oracle/stats", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Statistiques Oracle récupérées")
                print(f"   Succès: {result.get('success', False)}")
                
                if result.get('stats'):
                    stats = result['stats']
                    for collection, data in stats.items():
                        count = data.get('count', 0)
                        print(f"   {collection}: {count} enregistrements")
                
                self.test_results['oracle_stats'] = {'status': True, 'result': result}
                return True
            else:
                print(f"❌ Erreur stats Oracle: {response.status_code}")
                self.test_results['oracle_stats'] = {'status': False, 'error': response.text}
                return False
                
        except Exception as e:
            print(f"❌ Exception stats Oracle: {e}")
            self.test_results['oracle_stats'] = {'status': False, 'error': str(e)}
            return False
    
    def test_sample_questions(self):
        """Test des questions d'exemple"""
        print("\n💡 Test des questions d'exemple...")
        
        try:
            response = requests.get(f"{self.base_urls['backend_llm']}/api/sample-questions", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Questions d'exemple récupérées")
                
                questions = result.get('questions', [])
                categories = result.get('categories', [])
                
                print(f"   Questions: {len(questions)}")
                print(f"   Catégories: {len(categories)}")
                
                # Afficher quelques questions
                for i, q in enumerate(questions[:5]):
                    print(f"   {i+1}. {q}")
                
                self.test_results['sample_questions'] = {'status': True, 'result': result}
                return True
            else:
                print(f"❌ Erreur questions exemple: {response.status_code}")
                self.test_results['sample_questions'] = {'status': False, 'error': response.text}
                return False
                
        except Exception as e:
            print(f"❌ Exception questions exemple: {e}")
            self.test_results['sample_questions'] = {'status': False, 'error': str(e)}
            return False
    
    def generate_report(self):
        """Générer un rapport de test"""
        print("\n📋 Rapport de test final\n" + "="*50)
        
        total_tests = 0
        passed_tests = 0
        
        for test_name, test_data in self.test_results.items():
            if isinstance(test_data, dict) and 'status' in test_data:
                total_tests += 1
                if test_data['status']:
                    passed_tests += 1
                    print(f"✅ {test_name}: SUCCÈS")
                else:
                    print(f"❌ {test_name}: ÉCHEC")
            elif isinstance(test_data, dict):
                # Pour les tests avec sous-tests (comme chatbot)
                for sub_test, sub_data in test_data.items():
                    total_tests += 1
                    if sub_data.get('status', False):
                        passed_tests += 1
                        print(f"✅ {test_name}/{sub_test}: SUCCÈS")
                    else:
                        print(f"❌ {test_name}/{sub_test}: ÉCHEC")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\n📊 Résumé:")
        print(f"   Tests réussis: {passed_tests}/{total_tests}")
        print(f"   Taux de réussite: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print(f"\n🎉 Système opérationnel ! Taux de réussite excellent.")
        elif success_rate >= 60:
            print(f"\n⚠️  Système partiellement opérationnel. Quelques problèmes à résoudre.")
        else:
            print(f"\n🚨 Système en difficulté. Plusieurs problèmes à résoudre.")
        
        return success_rate
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        print("🚀 Début des tests du système Oracle Audit")
        print("=" * 60)
        
        # Test de santé
        self.test_service_health()
        time.sleep(2)
        
        # Test uploads
        self.test_csv_upload()
        time.sleep(2)
        
        self.test_excel_upload()
        time.sleep(2)
        
        # Test chatbot
        self.test_chatbot_questions()
        time.sleep(2)
        
        # Test stats Oracle
        self.test_oracle_stats()
        time.sleep(1)
        
        # Test questions exemple
        self.test_sample_questions()
        
        # Rapport final
        success_rate = self.generate_report()
        
        return success_rate

def main():
    """Fonction principale"""
    tester = SystemTester()
    
    try:
        success_rate = tester.run_all_tests()
        
        # Sauvegarder les résultats
        with open('test_results.json', 'w', encoding='utf-8') as f:
            json.dump(tester.test_results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n💾 Résultats sauvegardés dans test_results.json")
        
        return 0 if success_rate >= 80 else 1
        
    except KeyboardInterrupt:
        print("\n🛑 Tests interrompus par l'utilisateur")
        return 1
    except Exception as e:
        print(f"\n💥 Erreur fatale: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
