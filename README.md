# commit-standup

`commit-standup` is a command-line tool to get your commit history across multiple git repositories for the last few days.

## Usage

```sh
commit-standup
```
With custom options:
```sh
commit-standup --days 3 --folder ./my-repos
```
This outputs the last 7 days of commits made by you for all git repositories in the current folder.
Example output
```
Mon Sep 02 2024
        repo1:
                Initial commit
        repo2:
                fix(backend): added error handling to the routes
                feat: fixed bug with clashing cache values
        repo3:
                fix(nextjs): added button to edit user profile
                fix(react): fixed infinite render loop on home page


Sun Sep 01 2024
        No commits found.


Sat Aug 31 2024
        No commits found.


Fri Aug 30 2024
        repo2:
                Merge pull request #1220 from bugfix/feature/test-suite-completion
        repo4:
                fix(translations): fetch translations from database


Thu Aug 29 2024
        repo2:
                fix(backend): added error handling to the routes
                feat: fixed bug with clashing cache values


Wed Aug 28 2024
        ...


Tue Aug 27 2024
        ...


Mon Aug 26 2024
        repo1:
                Merge branch develop into master
                release: v1.0.3
```


## Options

- `--days`, `-d`: The number of days to go back in time (default: 7)
- `--folder`, `-f`: The base directory to search for git repositories (default: current working directory)
- `--ignore`, `-i`: A comma-separated list of directories to ignore while searching for .git repo folders (default: [`node_modules/**`, `dist/**`])
- `--depth`, `-p`: The depth of the search for .git repositories (default: 3)
- `--help`, `-h`: Show help information

## Examples

- Run the command with all defaults, using the current folder and go back 7 days:
  ```sh
  commit-standup
  ```

- Search in the folder `my-repos` and go back 1 day:
  ```sh
  commit-standup --days 1 --folder ./my-repos --depth 5 --ignore node_modules/** --ignore dist/**
  ```

## Description

`commit-standup` will search for git repositories within the specified folder (or the current working directory by default) and print the commit history for the specified number of days. It will display the commit messages for each day, grouped by repository.

## Installation

Run it directly with npx
```sh
npx commit-standup
```

Or install it globally with npm
```sh
npm install -g commit-standup
```
