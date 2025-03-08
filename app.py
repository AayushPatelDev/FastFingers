from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# List of words for typing test
# can also use api for getting words, I think this is really ez for short-term
word_list = [
    "hello", "world", "python", "flask", "typing", "speed", "test", "keyboard", "practice", "challenge",
    "quick", "brown", "fox", "jumps", "lazy", "dog", "programming", "developer", "javascript", "framework",
    "internet", "connectivity", "function", "variable", "constant", "server", "client", "network", "database",
    "engineer", "computer", "hardware", "software", "algorithm", "efficiency", "complexity", "artificial",
    "intelligence",
    "machine", "learning", "automation", "cybersecurity", "encryption", "decryption", "authentication", "authorization",
    "cloud", "computing", "frontend", "backend", "fullstack", "interface", "responsive", "mobile", "tablet", "desktop",
    "optimization", "deployment", "repository", "version", "control", "commit", "push", "pull", "merge", "conflict",
    "debugging", "error", "exception", "handling", "loop", "iteration", "recursion", "pointer", "reference",
    "dereference",
    "syntax", "semantics", "compiler", "interpreter", "runtime", "execution", "threading", "parallel", "asynchronous",
    "performance", "scalability", "load", "balancer", "container", "docker", "kubernetes", "virtualization",
    "hypervisor",
    "binary", "decimal", "hexadecimal", "octal", "floating", "integer", "character", "string", "boolean", "array",
    "list", "tuple", "dictionary", "set", "hashmap", "linked", "node", "graph", "tree", "heap",
    "stack", "queue", "priority", "search", "sorting", "merge", "quick", "bubble", "insertion", "selection",
    "dynamic", "programming", "greedy", "backtracking", "divide", "conquer", "brute", "force", "heuristic",
    "optimization",
    "compiler", "runtime", "debug", "testing", "unit", "integration", "system", "acceptance", "framework", "library",
    "dependency", "module", "package", "namespace", "scope", "lifecycle", "event", "listener", "callback", "promise",
    "fetch", "ajax", "http", "request", "response", "header", "cookie", "session", "csrf", "token",
    "json", "xml", "yaml", "parsing", "serializing", "deserializing", "encryption", "hashing", "salt", "bcrypt",
    "authentication", "oauth", "jwt", "token", "authorization", "role", "permission", "firewall", "intrusion",
    "detection",
    "monitoring", "logging", "analytics", "data", "warehouse", "big", "data", "streaming", "batch", "real-time"
]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_words')
def get_words():
    random_words = random.sample(word_list, 50)  # Fetch 50 random words
    return jsonify(random_words)


if __name__ == '__main__':
    app.run(debug=False)
