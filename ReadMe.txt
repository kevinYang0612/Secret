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