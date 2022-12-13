  
# INFORMATION  
  
In Overwatch 2 they removed the display on your hero portrait that shows your rank.  
This is a stream overlay to display that rank.  
  
# PREREQUISITES  
  
Requires [Node.js](https://nodejs.org/en/) to function.  
  
# INSTRUCTIONS  
  
* Rank Server  
    1. Download and extract the GitHub repository contents to anywhere on your computer.  
    2. Go into "./settings.json" and change "battletag" to your battletag.  
    3. Execute "./run.bat" or in cmd "node server.js" (You will need to run this every time you start OBS)  
* OBS Source  
    1. Open OBS and go to the scene you want to have your rank displayed on.  
    2. Create a new browser source and set the URL to "http://127.0.0.1:24209/index.html" & set size to 128x128.  
    3. Position browser source to be over your hero portrait or anywhere else.  
  
# DISCLAIMER  
  
<pre>
This project and its creator are not affiliated with Overwatch or Blizzard Entertainment.
Overwatch 2 and the Overwatch 2 assets are ©2022 Blizzard Entertainment, Inc.
</pre>  
  