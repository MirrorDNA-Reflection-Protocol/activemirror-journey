import time
from dotenv import load_dotenv
import os

# Load from specific path where we found the key
load_dotenv("safety_proxy/.env") 

from mirror_gate.core.memory_client import MemoryClient

def test_memory():
    print("⟡ Initializing Memory Client...")
    client = MemoryClient(user_id="test_user")
    
    if not client.enabled:
        print("X Memory layer disabled (mem0 not installed or failed).")
        return

    # 1. Add Memory
    test_content = f"The secret code is OMEGA-99 at {time.time()}"
    print(f"⟡ Adding memory: '{test_content}'")
    client.add(test_content, metadata={"type": "test"})
    
    # 2. Search Memory
    print("⟡ Waiting for indexing...")
    time.sleep(2) 
    
    print("⟡ Searching for 'secret code'...")
    results = client.search("what is the secret code?")
    
    print(f"\n[Search Results]\n{results}\n")
    
    if "OMEGA-99" in results:
        print("✓ SUCCESS: Memory persisted and retrieved.")
    else:
        print("X FAILURE: Could not find the test memory.")

if __name__ == "__main__":
    test_memory()
