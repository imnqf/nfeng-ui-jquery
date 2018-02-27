function Message(options) {
    options = options || {};
    if (typeof options === "string") {
        options = {
            message: options
        };
    }
    // 返回MessageConstructor实例
    return new MessageConstructor(options);
}

var MessageConstructor = function (options) {
    this.options = null;
    this.$template = null;
    this.msgId = null;
    this.closed = false;
    this.timer = null;
    this.init(options);
};

MessageConstructor.DEFAULT = {
    container : 'body',
    type: 'info',
    iconClass: '',
    customClass: '',
    duration: 3000,
    message: '',
    showClose: false,
    center: false,
    onClose: null,
    animateEnterClass : 'message-fade-enter',
    animateLeaveClass : 'message-fade-leave-active'
};

MessageConstructor.prototype = {
    getDefault: function () {
        return MessageConstructor.DEFAULT;
    },
    getOptions: function (options) {
        return $.extend({}, this.getDefault(), options);
    },
    getTemplate: function () {
        //生成一个随机5位数，作为id
        var msgId = 'msgId-';
        do {
            msgId += ~~(Math.random() * 100000)
        } while (document.getElementById(msgId));
        this.msgId = msgId;
        this.customClass = this.options.customClass;
        this.type = this.options.type;
        this.message = this.options.message;
        var typeClass = '';
        var iconClass = '';
        switch (this.type.toLowerCase()) {
            case 'info':
                typeClass = 'message--info';
                iconClass = 'el-icon-info';
                break;
            case 'success':
                typeClass = 'message--success';
                iconClass = 'el-icon-success';
                break;
            case 'warning':
                typeClass = 'message--warning';
                iconClass = 'el-icon-warning';
                break;
            case 'error':
                typeClass = 'message--error';
                iconClass = 'el-icon-error';
                break;
            default:
                throw new Error('类型必须为["info","success","warning","error"]其中之一');
                break;
        }
        var closeBtn = "";
        if (this.options.showClose) {
            closeBtn = '<i class="message__closeBtn el-icon-close"></i>';
        }
        if (this.options.iconClass) {
            iconClass = this.options.iconClass;
        }

        this.$template = $('<div class="message" id="' + msgId + '">');
        this.$template.html('<i class="message__icon ' + iconClass + '"></i>' +
            '<p class="message__content">' + this.message + '</p>' + closeBtn);
        this.$template.addClass(typeClass).addClass(this.customClass);
        if (this.options.center) {
            this.$template.addClass('is-center');
        }
        this.$closeBtn = this.$template.find('.message__closeBtn');
        var self = this;
        if (this.$closeBtn.length) {
            this.$closeBtn.on('click', function () {
                self.close();
            })
        }

        // 鼠标hover事件
        this.$template.hover(function () {
            self.clearTimer();
        }, function () {
            self.startTimer();
        });

        return this.$template;
    },
    showTemplate: function () {
        var self = this;
        self.$template.addClass(this.options.animateEnterClass);
        // 出现时动画,必须要用异步的方法移除类，而且时间必须大于0，否则可能不会有出现动画
        setTimeout(function () {
            self.$template.removeClass(self.options.animateEnterClass);
        }, 100);
        this.startTimer();
    },
    init: function (options) {
        this.options = this.getOptions(options);
        this.getTemplate().appendTo(this.options.container);
        this.showTemplate();
    },
    // 关闭即销毁
    close: function () {
        var self = this;
        this.closed = true;
        if (typeof this.options.onClose === 'function') {
            this.options.onClose(this);
        }
        //消失动画结束后销毁
        this.$template.addClass(this.options.animateLeaveClass).on('transitionend', function () {
            self.$template.remove();
        });
    },
    clearTimer: function () {
        clearTimeout(this.timer);
    },
    startTimer: function () {
        var self = this;
        var duration = this.options.duration;
        if (duration > 0) {
            this.timer = setTimeout(function () {
                if (!self.closed) {
                    self.close();
                }
            }, duration);
        }
    }
};

module.exports = {
    message: Message
};