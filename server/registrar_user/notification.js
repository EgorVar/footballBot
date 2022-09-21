var notification_time = 0;
var notification_time1 = 0;
var notification_timer = 0;
function notification(color, text, time, color_text){
    if(notification_timer != 0){
        clearInterval(notification_timer);
        notification_timer = 0;
        document.getElementById('notification').style.height = 0;
        setTimeout(() => {document.getElementById('notification').remove(); this.notification(color, text, time)},500);
        return;
    }
    notification_time = time;
    var date = new Date();
    notification_time1 = date.getTime();
    var span_color = hex2rgb(color);
    var color = hex2rgb(color);
    if(span_color.r > span_color.g+span_color.b){
        span_color.r = 100;
        span_color.g = 0;
        span_color.b = 0;
    }else if(span_color.g > span_color.r+span_color.b){
        span_color.r = 0;
        span_color.g = 100;
        span_color.b = 0;
    }else if(span_color.b > span_color.g+span_color.r){
        span_color.r = 0;
        span_color.g = 0;
        span_color.b = 100;
    }else if(span_color.r >= 127){
        span_color.r = 200;
        span_color.g = 200;
        span_color.b = 200;
    }else if(span_color.r < 127){
        span_color.r = 55;
        span_color.g = 55;
        span_color.b = 55;
    }
    var midel_color = Math.ceil((color.r + color.g + color.b)/3);
    var notification = document.createElement('div');
    notification.id = 'notification';
    notification.innerHTML = text+`<span id="n_s" style="background-color: rgb(${midel_color>=127?span_color.r-span_color.r*0.6:255-span_color.r*0.8}, ${midel_color>=127?span_color.g-span_color.g*0.6:255-span_color.g*0.8}, ${midel_color>=127?span_color.b-span_color.b*0.6:255-span_color.b*0.8})"></span>`;
    notification.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    notification.style.color = color_text?hex2rgb(color_text):`rgb(${midel_color>=127?color.r-color.r*0.6:255-color.r*0.8}, ${midel_color>=127?color.g-color.g*0.6:255-color.g*0.8}, ${midel_color>=127?color.b-color.b*0.6:255-color.b*0.8})`;
    document.getElementsByTagName('html')[0].appendChild(notification);
    setTimeout(() => {document.getElementById('notification').style.height = window.getComputedStyle(document.getElementById('notification')).maxHeight;},100)
    notification_timer = setInterval(() => {
        var date = new Date();
        var time1 = notification_time - (date.getTime() - notification_time1);
        document.getElementById('n_s').style.width = `${Math.ceil(100*time1/notification_time)}%`;
        if(time1 <= 0){
            clearInterval(notification_timer);
            notification_timer = 0;
            document.getElementById('notification').style.height = 0;
            setTimeout(() => {document.getElementById('notification').remove()},500);
        }
    }, 100);
}

function hex2rgb(c) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}