#! /usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fg from 'fast-glob';
import * as path from 'node:path';
import { argv } from 'node:process';
import yargs from 'yargs';

const execAsync = promisify(exec);

async function getGitUserName(): Promise<string> {
	const { stdout } = await execAsync('git config user.name');
	return stdout.trim();
}

function findGitFolderPaths(dir: string, depth: number, ignore: string[]): string[] {
	const gitDirs: string[] = fg.sync('**/.git', { cwd: dir, absolute: true, onlyDirectories: true, deep: depth, ignore });
	return gitDirs.map(gitDir => gitDir.substring(0, gitDir.length - '/.git'.length));
}

async function getGitLogs(folder: string, userName: string, daysAgo: number): Promise<string> {
	const command = `git log --author="${userName}" --since="${daysAgo} days ago 00:00" --until="${daysAgo} days ago 23:59" --pretty=format:"%s"`;
	const { stdout } = await execAsync(command, { cwd: folder });
	return stdout.trim();
}

async function printForDaysAgo(daysAgo: number, gitFolderPaths: string[], gitUsername: string): Promise<void> {
	const logPromises = gitFolderPaths.map(async (folderPath): Promise<{ folder: string, logs: string | null }> => {
		try {
			const gitLogs: string = await getGitLogs(folderPath, gitUsername, daysAgo);
			return { folder: path.basename(folderPath), logs: gitLogs?.trim() || null };
		} catch (err) {
			return { folder: path.basename(folderPath), logs: null };
		}
	});

	const results = await Promise.all(logPromises);

	results.forEach(({ folder, logs }: { folder: string, logs: string | null }) => {
		if (logs) {
			console.log(`\t${folder}:\n\t\t${logs.replace(/\n/g, '\n\t\t')}`);
		}
	});
	if (results.every(({ logs }) => !logs)) {
		// Output "No commits found" in a grey text color on the console
		console.log('\x1b[90m' + '\tNo commits found.' + '\x1b[0m');
	}
}

async function printLogs() {
	/**
	 * Describe the command line interface with --help option
	 */
	const parsedArguments = await yargs(argv)
			.scriptName('commit-standup')
			.usage('Usage: $0 [options]')
			.command('$0', 'Get your commit history across repositories for the last 7 days.')
			.example([
				['$0', 'Run the command with all defaults, using the current folder and go back 7 days.'],
				['$0 --days 1 --folder ./my-repos', 'Search in the folder my-repos and go back 1 day.']
			])

			.option('days', {
				alias: 'd',
				describe: 'The number of days to go back in time.',
				type: 'number',
				default: 7
			})

			.option('folder', {
				alias: 'f',
				describe: 'The base directory to search for git repositories.',
				type: 'string',
				default: process.cwd()
			})

			.option('depth', {
				alias: 'p',
				describe: 'How deep to search the folder that contains the repos.',
				type: 'number',
				default: 3
			})

			.option('ignore', {
				alias: 'i',
				describe: 'A list of glob patterns to exclude from the search for .git folders.',
				type: 'string',
				array: true,
				default: ['node_modules/**', 'dist/**']
			})

			.help('h')
			.alias('h', 'help')
			.alias('v', 'version')

			.wrap(null)
			.argv;

	const gitUserName = await getGitUserName();

	const gitFolderPaths = findGitFolderPaths(parsedArguments.folder, parsedArguments.depth, parsedArguments.ignore);

	for (let i = 0; i <= parsedArguments.days; i++) {
		const day = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
		console.log(day.toDateString());
		await printForDaysAgo(i, gitFolderPaths, gitUserName);
		console.log('\n');
	}
}

printLogs().catch(err => {
	console.error(err);
	process.exit(1);
});
