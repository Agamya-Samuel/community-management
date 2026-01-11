### Case 7: Handling Identifier Conflicts

**Scenario A: Email Conflict**
A MediaWiki user tries to add an email address ("john.doe@gmail.com"), but this email already belongs to another user who signed in with Google.

**What Should Happen:**
The system detects the conflict and shows a message: "This email address is already associated with another account. If this is your account, you can link them together. Would you like to review and merge these accounts?"

If the user confirms they own both accounts, they should be redirected to sign in with Google to prove ownership. After successful authentication, the system can merge the accounts by updating the MediaWiki user's account to include both authentication methods.

**Scenario B: Username Conflict**
A Google user tries to create a username ("WikiEditor2024"), but this username already belongs to a MediaWiki user.

**What Should Happen:**
The system shows an error: "This username is already taken. Please choose another username."

Unlike email conflicts, username conflicts typically should NOT trigger account merging, because usernames are public identifiers that might coincidentally be the same. The Google user simply needs to choose a different username.

### Case 8: Smart Account Detection and Merging

**What Happens:**
A user signs in with MediaWiki (username: "WikiEditor2024"), completes their profile by adding email "john.doe@gmail.com", verifies it, and uses the platform for a while. Later, they forget they have an account and try to sign in with Google using "john.doe@gmail.com".

The system performs a smart lookup:
1. Google returns email "john.doe@gmail.com"
2. System checks if this email exists in the users table
3. Finds existing user with this email (the MediaWiki account)
4. System recognizes this might be the same person

**Handling Options:**

**Option A: Automatic Linking (Less Secure)**
Automatically link the Google account to the existing user record. This is convenient but risky if someone else has access to that email.

**Option B: Verification Required (More Secure)**
Show a message: "We found an existing account with this email that was created via MediaWiki. For security, please sign in with MediaWiki first to confirm you own this account, then you can link your Google account from settings."

**I strongly recommend Option B** because email addresses can potentially be compromised or reassigned. Requiring the user to authenticate with their existing method first provides an additional security layer.

---

