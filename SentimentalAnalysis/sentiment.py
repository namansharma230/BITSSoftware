import re

# Simple sentiment analysis using keyword matching
def analyze_sentiment(text: str) -> str:
    text = text.lower()
    
    # Define positive and negative keywords
    positive_words = ['good', 'great', 'excellent', 'positive', 'happy', 'resolved', 'success', 'helpful']
    negative_words = ['bad', 'poor', 'terrible', 'negative', 'unhappy', 'issue', 'problem', 'fail', 'cheating', 'impersonation', 'severe']
    
    # Count occurrences
    positive_count = sum(1 for word in positive_words if re.search(r'\b' + word + r'\b', text))
    negative_count = sum(1 for word in negative_words if re.search(r'\b' + word + r'\b', text))
    
    # Determine sentiment
    if negative_count > positive_count:
        return "negative"
    elif positive_count > negative_count:
        return "positive"
    else:
        return "neutral"
