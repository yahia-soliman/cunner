#!/usr/bin/bash
# This script setups a tmux session for cunner development
# OS: Void Linux
# AUTHOR: Yahia Soliman

_SESSION=cunner

tmux has-session -t $_SESSION 2>/dev/null && tmux attach -t $_SESSION && exit

# make sure docker is running
doas sv up docker
# start the mongodb instance or create it first
docker start mongodb || docker run --name mongodb -p 27017:27017 -d mongo:7

tmux new-session -d -s $_SESSION -n 'editor'
tmux new-window -t $_SESSION -n 'servers'
tmux new-window -t $_SESSION -n 'db'
tmux split-window -h -t $_SESSION:db
tmux split-window -h -t $_SESSION:servers
tmux split-window -v -t $_SESSION:servers

tmux send-keys -t $_SESSION:editor.1 'nvim .' C-m
tmux send-keys -t $_SESSION:servers.3 'redis-server' C-m
tmux send-keys -t $_SESSION:servers.2 'npm run build:dev' C-m
tmux send-keys -t $_SESSION:servers.1 'npm run server:dev' C-m
tmux send-keys -t $_SESSION:db.1 'redis-cli' C-m
tmux send-keys -t $_SESSION:db.2 'docker exec -it mongodb mongosh' C-m

tmux attach -t $_SESSION:editor
