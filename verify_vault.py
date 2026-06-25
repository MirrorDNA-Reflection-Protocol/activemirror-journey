import os
import sys
from mirror_gate.core.vault_reader import VaultReader, DEFAULT_VAULT_PATH

def test_vault():
    print(f"⟡ Testing Vault Reader...")
    print(f"  Path: {DEFAULT_VAULT_PATH}")
    
    if not os.path.exists(DEFAULT_VAULT_PATH):
        print(f"  X Vault path does not exist!")
        return

    reader = VaultReader()
    context = reader.get_recent_context()
    
    if context:
        print("\n✅ SUCCESS: Context retrieved:")
        print("-" * 40)
        print(context[:500] + "..." if len(context) > 500 else context)
        print("-" * 40)
    else:
        print("\n⚠️  No recent files found (or permission denied).")
        print("    Try touching a file in the vault to create a 'recent' change.")
        
if __name__ == "__main__":
    test_vault()
