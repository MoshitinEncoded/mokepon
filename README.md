![Mokepon!](public/assets/readme-title.PNG)

A web page where you play a local multiplayer video game similar to rock-paper-scissors but with elemental pets.

In order to play, you need a computer that acts as a local server to which players can connect from their device's browser (chrome, firefox, edge, etc).

For this we will use a tool called **Node.js**. If you've never installed it, here's how to do it.

## How to install Node.js

First of all we will download the tool from its [official website](https://nodejs.org/en) by clicking on the **LTS** version, since it is the most stable version. This will download an installer to your computer.

Once downloaded, we run the installer, click on **next** several times and then **install**. Although the default installation options are fine, you can always change anything except an option called **Add to PATH**, as it will make it easier for us to run the server.

Once installed, download the repository by clicking **Code > Download ZIP**. Extract the folder wherever you want.


## Run the server

To run the server we must open the command console by typing in the search bar "Command Prompt" (**Windows**), "Terminal" (**Mac**) or from the applications menu (**Mac**/**Linux**).

Once open, we'll enter the following commands:

### Windows

-  If you saved the folder to a drive other than C: (replace **D:** with your drive)
    - D:
- We move to the directory of the extracted folder
    - cd "D:\path\to\mokepon"
- We run the server
    - node index.js

### Mac/Linux

- We move to the root directory
    - cd~
- We move to the directory of the extracted folder
    - cd /path/to/mokepon
- We run the server
    - node index.js

Wait a moment for the server to start. When it is working, the message **Server working!** will appear on the console.


## ALMOST THERE!

Now you can play the game by typing the server IP address in the search bar of any browser + port 8080. Example: **192.168.1.3:8080**

Remember that **this only works with devices that are in the same local network**.

To find out the IP address, type and execute the following line in your terminal or command console:
- ipconfig (**Win**)
    - Look for the one that says "IPv4 Address..."
- ifconfig (**Linux**)
    - The address is after "inet"
- If you're in **Mac**
    - ipconfig getifaddr en0 (**WiFi**)
    - ipconfig getifaddr en1 (**Ethernet**)

That's all, have fun!

*This project is an extended version made by me, from a free online course which you can find [here](https://platzi.com/cursos/programacion-basica/) (it's in spanish).*

## Sounds used

<summary>PeriTune</summary>

- [Battle Music](https://soundcloud.com/sei_peridot/8bitrpg-battle) - [License](https://creativecommons.org/licenses/by/3.0/)

<summary>Pixabay</summary>

- [Map Music](https://pixabay.com/es/sound-effects/8bittownthemesong-59266/)
- [Game UI](https://pixabay.com/es/sound-effects/game-ui-sounds-14857/)
- [Game Start](https://pixabay.com/es/sound-effects/game-start-6104/)
- [Battle Win](https://pixabay.com/es/sound-effects/winsquare-6993/)
- [Battle Lose](https://pixabay.com/es/sound-effects/failure-1-89170/)