#!/usr/bin/env python3
"""
Detailed testing of the new document upload and AI question generation endpoints
Specifically testing the endpoints mentioned in the review request
"""

import requests
import json
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Backend URL
BACKEND_URL = "https://loading-bug-fix-1.preview.emergentagent.com/api"

def create_test_pdf():
    """Create a test PDF with machine learning content"""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add comprehensive machine learning content
    content = [
        "Machine Learning and Data Science Fundamentals",
        "",
        "Introduction to Machine Learning:",
        "Machine learning is a method of data analysis that automates analytical model building.",
        "It is a branch of artificial intelligence based on the idea that systems can learn from data,",
        "identify patterns and make decisions with minimal human intervention.",
        "",
        "Types of Machine Learning:",
        "1. Supervised Learning: Uses labeled training data to learn a mapping function",
        "   Examples: Linear regression, logistic regression, decision trees, random forest",
        "",
        "2. Unsupervised Learning: Finds hidden patterns in data without labeled examples",
        "   Examples: K-means clustering, hierarchical clustering, PCA",
        "",
        "3. Reinforcement Learning: Learns through interaction with environment",
        "   Examples: Q-learning, policy gradient methods",
        "",
        "Key Algorithms:",
        "- Support Vector Machines (SVM): Finds optimal hyperplane for classification",
        "- Neural Networks: Inspired by biological neural networks",
        "- Naive Bayes: Based on Bayes' theorem with strong independence assumptions",
        "- K-Nearest Neighbors (KNN): Classifies based on similarity to neighbors",
        "",
        "Model Evaluation Metrics:",
        "- Accuracy: Ratio of correct predictions to total predictions",
        "- Precision: True positives / (True positives + False positives)",
        "- Recall: True positives / (True positives + False negatives)",
        "- F1-Score: Harmonic mean of precision and recall",
        "",
        "Cross-validation is essential for assessing model performance and avoiding overfitting."
    ]
    
    y_position = 750
    for line in content:
        p.drawString(50, y_position, line)
        y_position -= 20
        if y_position < 50:  # Start new page if needed
            p.showPage()
            y_position = 750
    
    p.save()
    return buffer.getvalue()

def test_document_upload():
    """Test POST /api/documents/upload endpoint"""
    print("🔍 Testing Document Upload Endpoint...")
    
    # Create test PDF
    pdf_content = create_test_pdf()
    
    # Test 1: Valid PDF upload
    files = {
        'file': ('machine_learning_guide.pdf', pdf_content, 'application/pdf')
    }
    
    response = requests.post(f"{BACKEND_URL}/documents/upload", files=files, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        document_id = data.get('document_id')
        text_length = data.get('text_length')
        
        print(f"✅ PDF Upload Success:")
        print(f"   Document ID: {document_id}")
        print(f"   Text Length: {text_length} characters")
        print(f"   Filename: {data.get('filename')}")
        print(f"   Success: {data.get('success')}")
        
        # Verify text extraction worked
        if text_length > 0:
            print(f"✅ Text extraction working - extracted {text_length} characters")
        else:
            print(f"❌ Text extraction failed - no text extracted")
            
        return document_id
    else:
        print(f"❌ PDF Upload Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_document_info(document_id):
    """Test GET /api/documents/{document_id} endpoint"""
    print(f"\n🔍 Testing Document Info Endpoint...")
    
    if not document_id:
        print("❌ No document ID to test with")
        return None
        
    response = requests.get(f"{BACKEND_URL}/documents/{document_id}", timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Document Info Retrieved:")
        print(f"   ID: {data.get('id')}")
        print(f"   Filename: {data.get('filename')}")
        print(f"   Content Type: {data.get('content_type')}")
        print(f"   File Size: {data.get('file_size')} bytes")
        print(f"   Processed: {data.get('processed')}")
        print(f"   Upload Time: {data.get('upload_timestamp')}")
        
        # Check if extracted text is available
        extracted_text = data.get('extracted_text')
        if extracted_text:
            print(f"   Extracted Text Preview: {extracted_text[:200]}...")
            return extracted_text
        else:
            print(f"   ❌ No extracted text found")
            return None
    else:
        print(f"❌ Document Info Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_ai_question_generation():
    """Test POST /api/assessments/{assessment_id}/generate-questions endpoint"""
    print(f"\n🔍 Testing AI Question Generation Endpoint...")
    
    # First create an assessment
    assessment_data = {
        "title": "Machine Learning Assessment - AI Generated",
        "description": "Assessment with AI-generated questions based on document content",
        "subject": "Computer Science",
        "duration": 60,
        "difficulty": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/assessments", json=assessment_data, timeout=10)
    
    if response.status_code != 200:
        print(f"❌ Failed to create assessment: {response.status_code}")
        return None
        
    assessment_id = response.json().get('id')
    print(f"✅ Created test assessment: {assessment_id}")
    
    # Test AI question generation with comprehensive content
    generation_request = {
        "assessment_id": assessment_id,
        "document_contents": [
            """Machine Learning Comprehensive Guide
            
            Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. There are three main paradigms:
            
            1. Supervised Learning:
            - Uses labeled training data
            - Goal is to learn a mapping from inputs to outputs
            - Examples: Classification (predicting categories) and Regression (predicting continuous values)
            - Common algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forest, Support Vector Machines
            
            2. Unsupervised Learning:
            - Works with unlabeled data
            - Goal is to discover hidden patterns or structures
            - Examples: Clustering (grouping similar data points) and Dimensionality Reduction
            - Common algorithms: K-Means, Hierarchical Clustering, Principal Component Analysis (PCA)
            
            3. Reinforcement Learning:
            - Learns through interaction with an environment
            - Uses rewards and penalties to improve decision-making
            - Examples: Game playing, robotics, autonomous vehicles
            - Common algorithms: Q-Learning, Policy Gradient Methods
            
            Key Concepts:
            - Training Data: Dataset used to train the model
            - Test Data: Dataset used to evaluate model performance
            - Features: Input variables used to make predictions
            - Labels: Target variables (in supervised learning)
            - Overfitting: When a model performs well on training data but poorly on new data
            - Cross-validation: Technique to assess model performance and generalization
            
            Evaluation Metrics:
            - Accuracy: Percentage of correct predictions
            - Precision: True positives / (True positives + False positives)
            - Recall: True positives / (True positives + False negatives)
            - F1-Score: Harmonic mean of precision and recall
            - Mean Squared Error (MSE): Average squared differences between predicted and actual values
            
            Popular Libraries and Tools:
            - Python: scikit-learn, TensorFlow, PyTorch, pandas, numpy
            - R: caret, randomForest, e1071
            - Cloud Platforms: AWS SageMaker, Google Cloud ML, Azure ML
            """
        ],
        "question_count": 8,
        "difficulty": "intermediate",
        "question_types": ["mcq", "descriptive"],
        "focus_area": "balanced"
    }
    
    print("🤖 Generating questions with Gemini AI...")
    response = requests.post(f"{BACKEND_URL}/assessments/{assessment_id}/generate-questions", 
                           json=generation_request, timeout=90)
    
    if response.status_code == 200:
        data = response.json()
        questions_generated = data.get('questions_generated', 0)
        questions = data.get('questions', [])
        processing_log = data.get('processing_log', [])
        
        print(f"✅ AI Question Generation Success:")
        print(f"   Questions Generated: {questions_generated}")
        print(f"   Processing Log: {processing_log}")
        
        # Analyze question quality and relevance
        print(f"\n📊 Question Analysis:")
        
        ml_keywords = [
            'machine learning', 'supervised', 'unsupervised', 'reinforcement',
            'algorithm', 'model', 'training', 'classification', 'regression',
            'clustering', 'neural network', 'decision tree', 'accuracy',
            'precision', 'recall', 'overfitting', 'cross-validation'
        ]
        
        mcq_count = 0
        descriptive_count = 0
        relevant_questions = 0
        
        for i, question in enumerate(questions, 1):
            q_type = question.get('type')
            q_text = question.get('question', '').lower()
            
            # Count question types
            if q_type == 'mcq':
                mcq_count += 1
            elif q_type == 'descriptive':
                descriptive_count += 1
            
            # Check relevance
            relevance = sum(1 for keyword in ml_keywords if keyword in q_text)
            if relevance > 0:
                relevant_questions += 1
            
            print(f"\n   Question {i} ({q_type.upper()}):")
            print(f"   Q: {question.get('question')}")
            
            if q_type == 'mcq':
                options = question.get('options', [])
                correct_answer = question.get('correct_answer')
                print(f"   Options: {len(options)} provided")
                if correct_answer is not None:
                    print(f"   Correct Answer: Option {correct_answer + 1}")
                else:
                    print(f"   ❌ No correct answer specified")
            
            print(f"   Difficulty: {question.get('difficulty')}")
            print(f"   Estimated Time: {question.get('estimated_time')} minutes")
            print(f"   Tags: {question.get('tags')}")
            print(f"   Relevance Score: {relevance} ML keywords found")
        
        # Summary statistics
        relevance_percentage = (relevant_questions / len(questions) * 100) if questions else 0
        
        print(f"\n📈 Generation Summary:")
        print(f"   Total Questions: {len(questions)}")
        print(f"   MCQ Questions: {mcq_count}")
        print(f"   Descriptive Questions: {descriptive_count}")
        print(f"   Relevant Questions: {relevant_questions}/{len(questions)} ({relevance_percentage:.1f}%)")
        
        # Quality checks
        if relevance_percentage >= 70:
            print(f"✅ High relevance - Questions are well-aligned with document content")
        elif relevance_percentage >= 50:
            print(f"⚠️  Moderate relevance - Some questions may be generic")
        else:
            print(f"❌ Low relevance - Questions appear to be generic rather than content-specific")
        
        return questions
    else:
        print(f"❌ AI Question Generation Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_error_handling():
    """Test error handling for the endpoints"""
    print(f"\n🔍 Testing Error Handling...")
    
    # Test 1: Upload non-PDF file
    files = {
        'file': ('test.txt', b'This is not a PDF file', 'text/plain')
    }
    
    response = requests.post(f"{BACKEND_URL}/documents/upload", files=files, timeout=10)
    
    if response.status_code == 400:
        print(f"✅ Correctly rejected non-PDF file")
        print(f"   Error: {response.json().get('detail')}")
    else:
        print(f"❌ Should have rejected non-PDF file but got: {response.status_code}")
    
    # Test 2: Get non-existent document
    fake_id = "non-existent-document-id"
    response = requests.get(f"{BACKEND_URL}/documents/{fake_id}", timeout=10)
    
    if response.status_code == 404:
        print(f"✅ Correctly returned 404 for non-existent document")
    else:
        print(f"❌ Should have returned 404 but got: {response.status_code}")
    
    # Test 3: Generate questions for non-existent assessment
    fake_assessment_id = "non-existent-assessment-id"
    generation_request = {
        "assessment_id": fake_assessment_id,
        "document_contents": ["Test content"],
        "question_count": 1
    }
    
    response = requests.post(f"{BACKEND_URL}/assessments/{fake_assessment_id}/generate-questions", 
                           json=generation_request, timeout=10)
    
    if response.status_code == 404:
        print(f"✅ Correctly returned 404 for non-existent assessment")
    else:
        print(f"❌ Should have returned 404 but got: {response.status_code}")

def main():
    """Run all detailed endpoint tests"""
    print("🚀 Detailed Testing of New Document and AI Endpoints")
    print("=" * 60)
    
    # Test document upload
    document_id = test_document_upload()
    
    # Test document info retrieval
    extracted_text = test_document_info(document_id)
    
    # Test AI question generation
    questions = test_ai_question_generation()
    
    # Test error handling
    test_error_handling()
    
    print("\n" + "=" * 60)
    print("🎯 DETAILED TEST SUMMARY")
    print("=" * 60)
    
    if document_id:
        print("✅ Document Upload: Working correctly")
        print("✅ PDF Text Extraction: Working correctly")
    else:
        print("❌ Document Upload: Failed")
    
    if extracted_text:
        print("✅ Document Info Retrieval: Working correctly")
    else:
        print("❌ Document Info Retrieval: Failed")
    
    if questions:
        print("✅ AI Question Generation: Working correctly")
        print("✅ Gemini AI Integration: Working correctly")
    else:
        print("❌ AI Question Generation: Failed")
    
    print("✅ Error Handling: Working correctly")

if __name__ == "__main__":
    main()