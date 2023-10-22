const log = (string, style) => {
    switch (style) {
        case 'info': {
            console.log('[INFO] ' + string);
            break;
        };

        case 'err': {
            console.error('[ERROR] ' + string);
            break;
        };

        case 'warn': {
            console.warn('[WARNING] ' + string);
            break;
        };

        case 'done': {
            console.log('[SUCCESS] ' + string);
            break;
        };

        default: {
            console.log(string);
            break;
        };
    };
};

module.exports = {
    log
};