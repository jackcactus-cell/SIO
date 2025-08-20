"""Script de test simple pour le chatbot"""
import asyncio
import json
from typing import Dict, Any

# Simulation du service OpenAI pour les tests
class MockOpenAIService:
    async def process_chat_message(self, message: str, user_id=None):
        """Simulation de traitement de message"""
        message_lower = message.lower()
        
        # Simulation de réponses basées sur des mots-clés
        if "utilisateur" in message_lower or "user" in message_lower:
            return MockResponse(
                type="table",
                data=[
                    {"username": "admin", "last_login": "2024-01-15", "status": "active"},
                    {"username": "user1", "last_login": "2024-01-14", "status": "active"},
                    {"username": "user2", "last_login": "2024-01-10", "status": "inactive"}
                ],
                columns=["username", "last_login", "status"],
                summary="Liste des utilisateurs du système",
                explanation="Voici les utilisateurs avec leur statut et dernière connexion"
            )
        elif "audit" in message_lower or "log" in message_lower:
            return MockResponse(
                type="table", 
                data=[
                    {"timestamp": "2024-01-15 10:30", "action": "LOGIN", "user": "admin", "result": "SUCCESS"},
                    {"timestamp": "2024-01-15 10:25", "action": "QUERY", "user": "user1", "result": "SUCCESS"},
                    {"timestamp": "2024-01-15 10:20", "action": "UPDATE", "user": "admin", "result": "SUCCESS"}
                ],
                columns=["timestamp", "action", "user", "result"],
                summary="Dernières activités d'audit",
                explanation="Voici les dernières actions enregistrées dans les logs d'audit"
            )
        elif "count" in message_lower or "nombre" in message_lower:
            return MockResponse(
                type="count",
                data="42",
                summary="Nombre total d'enregistrements trouvés: 42",
                explanation="Cette requête a retourné 42 résultats correspondant à vos critères"
            )
        else:
            return MockResponse(
                type="message",
                data="Je peux vous aider avec les requêtes sur les utilisateurs, les logs d'audit, ou les statistiques. Posez-moi une question spécifique !",
                summary="Réponse générale du chatbot"
            )

class MockResponse:
    def __init__(self, type, data, columns=None, summary=None, explanation=None):
        self.type = type
        self.data = data
        self.columns = columns
        self.summary = summary
        self.explanation = explanation

async def test_chatbot_endpoint(question: str):
    """Test de l'endpoint chatbot"""
    print(f"\n🤖 Question: {question}")
    
    # Simulation de l'endpoint
    mock_service = MockOpenAIService()
    
    try:
        response = await mock_service.process_chat_message(question)
        
        # Formatage de la réponse comme dans l'endpoint réel
        result = {
            "type": response.type,
            "data": response.data,
            "summary": response.summary,
            "explanation": response.explanation,
            "columns": response.columns
        }
        
        print(f"✅ Réponse: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return result
        
    except Exception as e:
        error_result = {
            "type": "error",
            "data": f"Erreur lors du traitement: {str(e)}",
            "summary": "Une erreur est survenue lors du traitement de votre question"
        }
        print(f"❌ Erreur: {json.dumps(error_result, indent=2, ensure_ascii=False)}")
        return error_result

async def main():
    """Test principal du chatbot"""
    print("🚀 Test du chatbot Oracle IA")
    print("=" * 50)
    
    # Questions de test
    test_questions = [
        "Montre-moi les utilisateurs du système",
        "Quels sont les derniers logs d'audit ?",
        "Combien d'enregistrements y a-t-il ?",
        "Comment optimiser une requête SQL ?",
        "Affiche les connexions récentes"
    ]
    
    for question in test_questions:
        await test_chatbot_endpoint(question)
        await asyncio.sleep(0.5)  # Pause entre les tests
    
    print("\n✨ Tests terminés !")

if __name__ == "__main__":
    asyncio.run(main())
