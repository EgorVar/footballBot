const
    fs = require('fs'),
    md5 = require('md5'),
    bd = require('../../database'),
    robokassa = require('node-robokassa'),
    QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk'),
    urlencode = require('urlencode');

const robokassaHelper = new robokassa.RobokassaHelper({
    // REQUIRED OPTIONS:
    merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN,
    hashingAlgorithm: 'md5',
    password1: process.env.ROBOKASSA_FIRST_PASSWORD,
    password2: process.env.ROBOKASSA_SECOND_PASSWORD,
    // OPTIONAL CONFIGURATION
    testMode: process.env.DEBUG == "true" ? true : false, // Whether to use test mode globally
    resultUrlRequestMethod: 'POST' // HTTP request method selected for "ResultURL" requests
});

const qiwiApi = new QiwiBillPaymentsAPI(process.env.QIWI_SECRET_KEY);

module.exports = async (req, res) => {
    var userId = req.params.userId;
    var chatId = req.params.chatId;
    if(userId.indexOf('.') !== -1){
        if(!fs.existsSync(`./server/pay/${userId}`)){
            res.status(404).send('Страница не найдена :(');
            return;
        }
        var mime_type = userId.search(/.html$/)!=-1?'text/html':userId.search(/.css$/)!=-1?'text/css':userId.search(/.js$/)!=-1?'text/javascript':userId.search(/.jpg$/)!=-1?'image/jpeg':'text/plain';
        res.writeHead(200, {'Content-Type': mime_type});
        res.end(fs.readFileSync(`./server/pay/${userId}`));
        return;
    }

    var payPage = fs.readFileSync(`./server/pay/index.html`).toString();
    var userInfo = await bd.get(`id==${userId}`)[0];
    var chatInfo = await bd.get_chat(chatId);

    // console.log(userInfo);
    if(chatInfo.stage == "end" || chatInfo.stage == "paid"){ // Если кнопка оплаты есть
        const play = userInfo[`${chatId}_play`];
        const paid = userInfo[`${chatId}_paid`];
        if(play == 2){ // Если идёт на игру
            if(!paid){ // Если не оплачено ранее
                var orderId = null
                var orderAmount = null

                if(chatInfo.discount.indexOf(+userId) != -1) {
                  orderId = chatInfo.orderID1
                  orderAmount = chatInfo.amount1
                } else if(chatInfo.individualPrice.indexOf(+userId) != -1) {
                  orderId = 186
                  orderAmount = userInfo.individual_price
                } else {
                  orderId = chatInfo.orderID
                  orderAmount = chatInfo.amount
                }

                console.log(chatInfo.orderID1, userInfo.individual_price)

                const description = 'Игровой взнос';

                  if(req.query.redirect == 'payPage'){
                      let paymentUrl;
                      const billId = qiwiApi.generateId();
                      if(!chatInfo.paid_online_white){
                        paymentUrl = await qiwiApi.createPaymentForm({
                            publicKey: process.env.QIWI_PUBLIC_KEY,
                            amount: orderAmount,
                            billId: billId,
                            successUrl: `https://xn--80afo7al4d.xn----btbtarbil8ajk.xn--80adxhks/thanks/?billId=${billId}`,
                            "customFields[userId]": userId,
                            "customFields[chatId]": chatId,
                            "customFields[themeCode]": process.env.QIWI_THEME_CODE,
                            comment: "Добровольный взнос на игру в футбол в СОЮЗе",
                        });
                    } else {
                        // Robokassa
                        const billId = Math.floor(Math.random() * (2147483647 - 1 + 1)) + 1;
                        paymentUrl = await getRobokassaLink(orderAmount, description, billId, { userId: userId, chatId: chatId })

                        // paymentUrl = robokassaHelper.generatePaymentUrl(orderAmount, description, {
                        //     invId: billId,
                        //     userData: {
                        //         userId: userId,
                        //         chatId: chatId
                        //     }
                        // });
                        // OLD Free-Kassa
                        // const paymentUrl = `https://www.free-kassa.ru/merchant/cash.php?m=${chatInfo.merchantID}&oa=${orderAmount}&o=${orderId}&s=${md5(`${chatInfo.merchantID}:${orderAmount}:${chatInfo.secretWord}:${orderId}`)}&us_id=${userId}&us_chat_id=${chatInfo.id}`;
                        // New FreeKassa
                        // const paymentUrl = `https://pay.freekassa.ru/?m=${chatInfo.merchantID}&oa=${orderAmount}&currency=RUB&o=${orderId}&s=${md5(`${chatInfo.merchantID}:${orderAmount}:${chatInfo.secretWord}:RUB:${orderId}`)}&us_id=${userId}&us_chat_id=${chatInfo.id}`;
                        // console.log(paymentUrl);
                    }
                    // return console.log(paymentUrl);

                    // console.log(paymentUrl);
                    await bd.set(`id==${userId}`, `${chatInfo.id}_recording_time%=%${userInfo[`${chatInfo.id}_recording_time`]+600000}`);
                    return res.redirect(paymentUrl);
                }
                payPage = payPage.replace(/%%jsCode%%/g, '');
                payPage = payPage.replace(/%%orderId%%/g, orderId);
                payPage = payPage.replace(/%%orderValue%%/g, orderAmount);
                payPage = payPage.replace(/%%orderName%%/g, `${chatInfo.name}`);
                payPage = payPage.replace(/%%orderDesc%%/g, `${description}`);
            }else{ // Уже оплачено
                payPage = payPage.replace('%%jsCode%%', `<script type="text/javascript">
                    alert('Вы уже оплатили игру.');
                    window.close();
                </script>`);
            }
        }else{
            payPage = payPage.replace('%%jsCode%%', `<script type="text/javascript">
                alert('Вам оплачивать не нужно.');
                window.close();
            </script>`);
        }
    }else{
        payPage = payPage.replace('%%jsCode%%', `<script type="text/javascript">
            alert('Данная операция неактуальна.');
            window.close();
        </script>`);
    }

    res.status(200).send(payPage);
    return;
}

async function getRobokassaLink(amount, description, order_id, userData) {
    const mrh_login = process.env.ROBOKASSA_MERCHANT_LOGIN;      // your login here
    const mrh_pass1 = process.env.ROBOKASSA_FIRST_PASSWORD;   // merchant pass1 here
    const inv_id = order_id;
    const inv_desc = description;
    const out_summ = amount;
    const receipt = JSON.stringify({
        "sno": "osn",
        "items": [
            {
                "name": "Мини-футбол",
                "quantity": 1,
                "sum": amount,
                "payment_method": "full_payment",
                "payment_object": "commodity",
                "tax": "none"
            }
        ]
    });

    const { userId, chatId } = userData;

    const receipt_urlencode = urlencode(receipt);
    const crc = md5(`${mrh_login}:${out_summ}:${inv_id}:${receipt}:${mrh_pass1}:Shp_chatId=${chatId}:Shp_userId=${userId}`);

    const url = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${mrh_login}&OutSum=${out_summ}&InvId=${inv_id}&Description=${inv_desc}&Receipt=${receipt_urlencode}&Shp_chatId=${chatId}&Shp_userId=${userId}&SignatureValue=${crc}`;
    return url;
}
