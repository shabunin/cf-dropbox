iViewer4 dropbox integration
============

This gui implements dropbox authorization, reading dropbox file and file uploading. As example i made remote gui updating.
Its not full implementation of dropbox core api. If you need more - check docs at page https://www.dropbox.com/developers/core/docs and add requests that you need.

Create App
============
Create your own app in dropbox app console https://www.dropbox.com/developers/apps

1. Create App
2. Type of app: Dropbox API app
3. Type of data: Files and datastores
4. Can your app be limited to its own folder: No
5. Type of files: All
6. Choose app name
7. Open app settings
8. Add http://localhost:5000 and http://localhost:5000/ to redirect URIs
9. Copy App key and App secret to dropbox.js in appropriate fields

GUI
==============

Open cf-dropbox.gui in editor and open global token manager. Change dropboxFolder token to yours. It should look like /dir1/dir2/dir3. Create this path in dropbox and place there settings.json file.

settings.json
---------------
{"gui":{"update":"no","file":"cf-dropbox.gui.zip"},"debug":1}

It may contain any settings that you want to store in cloud. In my gui i use it in updateSettings function.

updateSettings()
--------------- 
Called at start from userMain function.

1. Request file settings.json. If success execute callback function.
2. Send log if debug == 1. Call callback in any case.
3. Check update setting. If update required request url for gui file. If file exist then call callback function.
4. Change update setting to "no" and upload settings.json file. If uploaded success then update GUI!

Launch gui
================ 
At first launch subpage with browser will be shown asking for app authorization.
Type your credentials and grant access to your app. After that you check debug page and find access token that dropbox give to your app. Copy it and assign to global token "access_token". There is dropbox.saveGlobalToken function but after gui reloading all of your global tokens will be cleared and you will need to pass authorization again. Make this to be sure that in any case iViewer get access to dropbox.
