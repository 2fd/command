import {
    InputInterface,
    OutputInterface,
    QuickCommandType,
    FlagInterface,
    ParamInterface
} from '../../../lib/interfaces';
import {Command} from '../../../lib/command/command';
import {IgnoreParams} from '../../../lib/command/params';
import {DummyOutput} from '../../../lib/command/io/output';

export class RemoteCommand extends Command<{}, {}> {

    description = 'Command: RemoteCommand';

    params = new IgnoreParams();

    flags = [];

    action(input: InputInterface<{}, {}>, output: OutputInterface) {
        output.log('RemoteCommand OUTPUT LOG');
    }
}

export let remoteCommand = new RemoteCommand;

export let quickCommand: QuickCommandType =
    function QuickCommand(input: InputInterface<{}, {}>, output: OutputInterface) {
        output.log('QuickCommand OUTPUT LOG');
    };


export function consume(consumer: FlagInterface<any> | ParamInterface<any>, input: InputInterface<any, any>): InputInterface<any, any> {

    let output = new DummyOutput;

    consumer.before(input, output);

    while (input.argv.length > 0) {
        let f = input.argv.shift();

        consumer.parse(f, input, output);
    }

    consumer.after(input, output);

    return input;
}