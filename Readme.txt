	#########################################
	# COMP2406 Assignment 4 Exam Server	#
	#		by Daniel Fitzhenry	#
	#########################################

This program can be run by opening a terminal at the current directory and entering in the command line:
	~$	npm install
	~$	node app.js

Now visit http://127.0.0.1:3000/intro where client will be prompted to enter credentials for authentication.
Here is the schema of the users table of database db_exam in the data directory:

userid		password		result		attempts
--------	---------------	-----------	----------
studentA	2406			0.0			2
studentB	2406A			0.0			2

After authentication, client may proceed to /intro page. The rest of the instructions will be provided.
DESIGN ENHANCEMENT OPTIONS:
	- Randomizes served questions for each client.
	- Provides a working maximum attempt feature changeable by the variable totalAttempts.
	- Exam has a time limit feature changeable by the variable examTimeInMinutes. *NOTE* NO RESULTS RECORDED IF NOTHING SUBMITED BEFORE TIMELIMIT
	- Results page serves average of all results from users table.