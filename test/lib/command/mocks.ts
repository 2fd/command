import {
    InputInterface,
    OutputInterface,
    QuickCommandType
} from '../../../lib/command.d.ts';
import {Command} from '../../../lib/command/command';
import {NoParams} from '../../../lib/command/params';

class RemoteCommand extends Command {

    description = 'Command: RemoteCommand';

    params = new NoParams();

    flags = [];

    action(input: InputInterface, output: OutputInterface) {
        output.log('RemoteCommand OUTPUT LOG');
    }
}

export let remoteCommand = new RemoteCommand;

export let quickCommand: QuickCommandType =
    function QuickCommand (input: InputInterface, output: OutputInterface) {
        output.log('QuickCommand OUTPUT LOG');
    };

    quickCommand.description = 'Command: quickCommand';