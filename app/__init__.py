from flask import Flask, render_template

app = Flask(__name__)    #create Flask object

if __name__ == "__main__": #false if this file imported as module
    app.debug = True 
    app.run(host='0.0.0.0')
