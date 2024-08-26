module.exports = [
	{
		label: 'Make',
		icon: 'new-file',
		description: 'Create new files',
		children: [
			{
				label: "make:controller",
				command: "laravelMakeCommands.runMakeController",
				description: "Create a new controller",
				prompt: "Enter controller name",
				terminalCommand: "php artisan make:controller"
			},
			{
				label: "make:model",
				command: "laravelMakeCommands.runMakeModel",
				description: "Create a new model",
				prompt: "Enter model name",
				terminalCommand: "php artisan make:model"
			},
			{
				label: "make:migration",
				command: "laravelMakeCommands.runMakeMigration",
				description: "Create a new migration file",
				prompt: "Enter migration name",
				terminalCommand: "php artisan make:migration"
			},
			{
				label: "make:seeder",
				command: "laravelMakeCommands.runMakeSeeder",
				description: "Create a new seeder",
				prompt: "Enter seeder name",
				terminalCommand: "php artisan make:seeder"
			},
			{
				label: "make:factory",
				command: "laravelMakeCommands.runMakeFactory",
				description: "Create a new factory",
				prompt: "Enter factory name",
				terminalCommand: "php artisan make:factory"
			},
			{
				label: "make:middleware",
				command: "laravelMakeCommands.runMakeMiddleware",
				description: "Create a new middleware",
				prompt: "Enter middleware name",
				terminalCommand: "php artisan make:middleware"
			},
			{
				label: "make:request",
				command: "laravelMakeCommands.runMakeRequest",
				description: "Create a new form request",
				prompt: "Enter request name",
				terminalCommand: "php artisan make:request"
			},
			{
				label: "make:event",
				command: "laravelMakeCommands.runMakeEvent",
				description: "Create a new event",
				prompt: "Enter event name",
				terminalCommand: "php artisan make:event"
			},
			{
				label: "make:listener",
				command: "laravelMakeCommands.runMakeListener",
				description: "Create a new listener",
				prompt: "Enter listener name",
				terminalCommand: "php artisan make:listener"
			},
			{
				label: "make:command",
				command: "laravelMakeCommands.runMakeCommand",
				description: "Create a new artisan command",
				prompt: "Enter command name",
				terminalCommand: "php artisan make:command"
			},
			{
				label: "make:job",
				command: "laravelMakeCommands.runMakeJob",
				description: "Create a new job",
				prompt: "Enter job name",
				terminalCommand: "php artisan make:job"
			},
			{
				label: "make:policy",
				command: "laravelMakeCommands.runMakePolicy",
				description: "Create a new policy",
				prompt: "Enter policy name",
				terminalCommand: "php artisan make:policy"
			},
			{
				label: "make:provider",
				command: "laravelMakeCommands.runMakeProvider",
				description: "Create a new service provider",
				prompt: "Enter provider name",
				terminalCommand: "php artisan make:provider"
			},
			{
				label: "make:test",
				command: "laravelMakeCommands.runMakeTest",
				description: "Create a new test",
				prompt: "Enter test name",
				terminalCommand: "php artisan make:test"
			},
			{
				label: "make:mail",
				command: "laravelMakeCommands.runMakeMail",
				description: "Create a new mailable class",
				prompt: "Enter mail class name",
				terminalCommand: "php artisan make:mail"
			},
			{
				label: "make:notification",
				command: "laravelMakeCommands.runMakeNotification",
				description: "Create a new notification",
				prompt: "Enter notification name",
				terminalCommand: "php artisan make:notification"
			},
			{
				label: "make:resource",
				command: "laravelMakeCommands.runMakeResource",
				description: "Create a new API resource",
				prompt: "Enter resource name",
				terminalCommand: "php artisan make:resource"
			},
			{
				label: "make:rule",
				command: "laravelMakeCommands.runMakeRule",
				description: "Create a new custom validation rule",
				prompt: "Enter rule name",
				terminalCommand: "php artisan make:rule"
			},
			{
				label: "make:observer",
				command: "laravelMakeCommands.runMakeObserver",
				description: "Create a new observer",
				prompt: "Enter observer name",
				terminalCommand: "php artisan make:observer"
			},
			{
				label: "make:channel",
				command: "laravelMakeCommands.runMakeChannel",
				description: "Create a new broadcasting channel",
				prompt: "Enter channel name",
				terminalCommand: "php artisan make:channel"
			},
			{
				label: "make:exception",
				command: "laravelMakeCommands.runMakeException",
				description: "Create a new custom exception",
				prompt: "Enter exception name",
				terminalCommand: "php artisan make:exception"
			},
			{
				label: "make:console",
				command: "laravelMakeCommands.runMakeConsole",
				description: "Create a new console command",
				prompt: "Enter console command name",
				terminalCommand: "php artisan make:console"
			},
			{
				label: "make:scope",
				command: "laravelMakeCommands.runMakeScope",
				description: "Create a new query scope",
				prompt: "Enter scope name",
				terminalCommand: "php artisan make:scope"
			},
			{
				label: "make:cast",
				command: "laravelMakeCommands.runMakeCast",
				description: "Create a new custom Eloquent cast",
				prompt: "Enter cast name",
				terminalCommand: "php artisan make:cast"
			},
			{
				label: "make:component",
				command: "laravelMakeCommands.runMakeComponent",
				description: "Create a new Blade component",
				prompt: "Enter component name",
				terminalCommand: "php artisan make:component"
			}
		]
	},
	{
		label: 'Migrate & Database',
		icon: 'database',
		description: 'Run database migrations',
		children: [
			{
				label: "migrate",
				command: "laravelMigrateCommands.runMigrate",
				description: "Run the database migrations",
				prompt: null,
				terminalCommand: "php artisan migrate"
			},
			{
				label: "migrate:rollback",
				command: "laravelMigrateCommands.runMigrateRollback",
				description: "Rollback the last database migration",
				prompt: null,
				terminalCommand: "php artisan migrate:rollback"
			},
			{
				label: "migrate:refresh",
				command: "laravelMigrateCommands.runMigrateRefresh",
				description: "Reset and re-run all migrations",
				prompt: null,
				terminalCommand: "php artisan migrate:refresh"
			},
			{
				label: "migrate:reset",
				command: "laravelMigrateCommands.runMigrateReset",
				description: "Rollback all database migrations",
				prompt: null,
				terminalCommand: "php artisan migrate:reset"
			},
			{
				label: "migrate:status",
				command: "laravelMigrateCommands.runMigrateStatus",
				description: "Show the status of each migration",
				prompt: null,
				terminalCommand: "php artisan migrate:status"
			},
			{
				label: "migrate:fresh",
				command: "laravelMigrateCommands.runMigrateFresh",
				description: "Drop all tables and re-run all migrations",
				prompt: null,
				terminalCommand: "php artisan migrate:fresh"
			},
			{
				label: "migrate:install",
				command: "laravelMigrateCommands.runMigrateInstall",
				description: "Create the migration repository",
				prompt: null,
				terminalCommand: "php artisan migrate:install"
			},
			{
				label: "migrate:make",
				command: "laravelMigrateCommands.runMakeMigration",
				description: "Create a new migration file",
				prompt: "Enter migration name",
				terminalCommand: "php artisan make:migration"
			},
			{
				label: "db:seed",
				command: "laravelMigrateCommands.runDbSeed",
				description: "Seed the database with records",
				prompt: null,
				terminalCommand: "php artisan db:seed"
			},
			{
				label: "db:wipe",
				command: "laravelMigrateCommands.runDbWipe",
				description: "Drop all tables, views, and types",
				prompt: null,
				terminalCommand: "php artisan db:wipe"
			},
			{
				label: "db:show",
				command: "laravelMigrateCommands.runDbShow",
				description: "Show the database table status",
				prompt: null,
				terminalCommand: "php artisan db:show"
			},
			{
				label: "db:table",
				command: "laravelMigrateCommands.runDbTable",
				description: "Describe the given database table",
				prompt: "Enter table name",
				terminalCommand: "php artisan db:table"
			},
			{
				label: "db:prune",
				command: "laravelMigrateCommands.runDbPrune",
				description: "Prune models that are no longer needed",
				prompt: null,
				terminalCommand: "php artisan db:prune"
			},
			{
				label: "db:monitor",
				command: "laravelMigrateCommands.runDbMonitor",
				description: "Monitor the status of the database",
				prompt: null,
				terminalCommand: "php artisan db:monitor"
			}
		]
	},
	{
		label: 'Misc',
		icon: 'tools',
		description: 'Miscellaneous Laravel commands',
		children: [
			{
				label: "serve",
				command: "laravelCommands.runServe",
				description: "Serve the application on the PHP development server",
				terminalCommand: "php artisan serve"
			},
			{
				label: "optimize",
				command: "laravelCommands.runOptimize",
				description: "Optimize the framework for better performance",
				terminalCommand: "php artisan optimize"
			},
			{
				label: "route:list",
				command: "laravelCommands.runRouteList",
				description: "List all registered routes",
				terminalCommand: "php artisan route:list"
			}
		]
	}
];