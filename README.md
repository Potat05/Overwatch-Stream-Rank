  
# INFORMATION  
  
In Overwatch 2 they removed the display on your hero portrait that shows your rank.  
This is a stream overlay to display that rank.  
  
# PREREQUISITES  
  
Requires [Node.js](https://nodejs.org/en/) to function.  
  
# INSTRUCTIONS  
  
* Rank Server  
    1. Download and extract the GitHub repository contents to anywhere on your computer.  
    2. Execute "./run.bat" or in cmd "node server.js" (You will need to run this every time you start OBS)  
* OBS Source  
    1. Open OBS and go to the scene you want to have your rank displayed on.  
    2. Create a new browser source and set size to 128x128.  
    3. Set source URL to `http://127.0.0.1:24209/pages/profile?battletag=*yourBattletag*`  
    4. Replace the '#' in your battletag with '%23'  
    5. Position browser source to be over your hero portrait or anywhere else.  
  
## Profile parameters  
**battletag** - Battletag with '#' replaced with '%23'  
**getranktype** - What rank to get, options: TANK DAMAGE SUPPORT AVERAGE HIGHEST  
Example of multiple parameters `http://127.0.0.1:24209/pages/profile?battletag=example%2312345&getranktype=highest`  
  
# DISCLAIMER  
  
<pre>
This project and its creator are not affiliated with Overwatch or Blizzard Entertainment.
Overwatch 2 and the Overwatch 2 assets are ©2022 Blizzard Entertainment, Inc.
</pre>  
  