This is the repo for Odin Project - Project: File Uploader

The app will be set up with the following pages:

1. sign up page
2. log in page
3. user homepage for CRUD after successful login, the homepage UI will contain:
   a. the option to create folder
   b. a list existing folders and files in the master folder
   c. the option to delete folder/ files
   d. the option to rename folder/ files
   e. the option to view the folder/ details of the file
   => this page can be created as a reusable ejs page that reads from data from the database

The database will store the following info in tables:

1. user info
2. user's file and folders
   a. the file will contain data as follows:
   i. name
   ii. size
   iii. upload time
   b. the folder data can be file and folder, hence the folder model will contain data as follows:
   i. name
   ii. array of files
   iii. array of folders

App logic:

1. a new user signs up
2. the new user is created and registered in the database
3. similar to Google Drive, the user should have a master folder that can contains either folders or files once logged in successfully, hence a folder should be created simultaneously as a new user is created
4. the new user logs in and sees the folders/file in his master folder
5. the user should be able to add new folders or upload files at any folder
6. the user should be able to navigate into different folders and carry out (5)
