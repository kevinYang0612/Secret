A web application for me to learn security and encryption

Level 1: no encryption for password, check input password against the database password

Level 2: use encryption mongoose-encryption, use a key + a password = encryption code,
check input cipher password + key against the encrypted code in database.
The key is saved in .env file and it should be in gitignore.

level 3: Hashing the password, using MD5 function to hash the password to be a hashcode and save in database.
check input password with the MD5 function again the hashcode in database

level 4: Hashing with Salting, using bcyrpt to generate a salt, Hash the (salt + password) with 10 times.
Then compare using built-in function bcrypt.compare(password, user.password, function(err, result)
1st param is the user input password, checking again 2nd param which saved in the database.

Level 5: Use passport.js to add cookies and sessions. A user registered or login in, after a while,
the user is still able to access /secrets page due to cookie got user session ID. When quit browser
or restart the server, cookie will be gone.

Level 6: OAuth, basically signing in using Google, Facebook, and etc to gain security because these
companies tend to have a better security to store their user information. What we need to do is
request from Google, Facebook.

Step 1: set up your app -- tell the third party like Google, Twitter, Facebook

Step 2: Redirect to Authenticate -- when user tries to login, we give them the option to
login Google, Twitter, Facebook

Step 3: User Logs in -- the page actually take the user to the actual Google, Twitter, or Facebook to login

Step 4: User Grants permission -- you might want your profile and email, you grant that permission

Step 5: Receive Authorization code -- our website receives an authorization code from Google, Twitter, or Facebook.
This allows us to check to make sure that user actually successfully signed on to Google, Twitter, or Facebook.

Lastly: the web app is finished with Level 6 security, our user can easily
tie their account with Google and be able to login. Submit a secret
and everyone can see it anonymously!