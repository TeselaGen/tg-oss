# Teselagen's Open Source Mono Repo

# Repo Philosophy
This is a monorepo composed of multiple packages under /packages. 
There are two types of packages, utils and ui (react) packages. 
UI packages have everything util packages have but also have a demo and e2e cypress tests.
The config files for each package should extend the root config files.

# NX 
We use NX to run tasks (https://nx.dev) and cache the task results.
NX allows us to only lint/build/test the packages that have changed since the last commit and caches the results of the tasks for efficient reruns.

## Getting Started

Install Deps 
  
  ```bash 
  yarn install
  ```

