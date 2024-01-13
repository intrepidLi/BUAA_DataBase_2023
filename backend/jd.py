import requests
import parsel

def request_jingdong_and_parsel(keyword):
    cookie = "shshshfpa=1f7405e9-11e6-eb6a-aae9-79026d3d1dc2-1684927084; shshshfpx=1f7405e9-11e6-eb6a-aae9-79026d3d1dc2-1684927084; qrsc=3; pinId=tciNP-cu9gUV_Z8fyfQA5Q; pin=jd_XSmvnMAHvqjJ; unick=jd_XSmvnMAHvqjJ; _tp=%2BXEyJ4ivYFNG8SCuPxaZqw%3D%3D; _pst=jd_XSmvnMAHvqjJ; __jdu=2034284339; unpl=JF8EALBnNSttD0JRBh0FHUYSQl5RWwpcQx8EOzIAUQ9dH1UFT1FJFUJ7XlVdXxRLFB9ubxRUVFNLXA4YACsSEXteXVdZDEsWC2tXVgQFDQ8VXURJQlZAFDNVCV9dSRZRZjJWBFtdT1xWSAYYRRMfDlAKDlhCR1FpMjVkXlh7VAQrARoQFUhUUVxfAHsWM2hXNWRdW0JUARoyGiIRex8AAlkLSBcCbSoGVV9dSF0AGQATIhF7Xg; __jdv=76161171|baidu-pinzhuan|t_288551095_baidupinzhuan|cpc|0f3d30c8dba7459bb52f2eb5eba8ac7d_0_f842767e38244fe996ed44c4e01ebc6c|1702117163483; 3AB9D23F7A4B3CSS=jdd03N7DHYIECTBG2Q5I5I7FYMCUVLRQ6JT5BEKEEKW34RH43JFAYFVLF34WLOQWXTUWTX33UXMQM7GN34JSUZICBBTAJNMAAAAMMJYLMH5AAAAAACGUWVY46DUKLJYX; _gia_d=1; areaId=1; ipLoc-djd=1-2800-0-0; PCSYCityID=CN_110000_110100_0; wlfstk_smdl=6pv8az8hfl6sfyddc3meyn2pvi7oecik; TrackID=1-5WBvpuAw4wh_tm8g-i94eniHuxBn3Tu-RevIporWl24XdrmmatMCC_kuquSRLfaeZ5T7aQN2XrSajYDaymsp3NMo3eIv5Pc8kQtfCvATx6-YavdzVPig2uwR8UA4bRV; thor=3D7DD7D1E4C91AB253769D2956E7C46AC53172504316C77415856EF7BA5AFC507F728FB7A1F7AF41AEEBAF353A8186210E918DC17ECF8AAF2E2C6387234030BDD2B03CB6918A7062960ECEB956AAFD6A893E3F4E8B0A0B4B9886749FEFDB35E9C4E99E217B5513F1887A9B876BD463B522F292D626FC0CCCE4B5748AF9D61CB8B94D75410B61908E29DD1B60E13873E44F73A686E78C375106D7E96F6A5E02A2; flash=2_JSrmIBC--PmFtK_uPGW7M6OQff7fEWY-nqzaWl67cp_tuxhFXg_WYtZOUZWaEG9R56Aw2vFNNA_TAMrLc10XVaPgkcs66udHEExPr3SAn1h*; ceshi3.com=000; jsavif=1; jsavif=1; xapieid=jdd03N7DHYIECTBG2Q5I5I7FYMCUVLRQ6JT5BEKEEKW34RH43JFAYFVLF34WLOQWXTUWTX33UXMQM7GN34JSUZICBBTAJNMAAAAMMJYLMH5AAAAAACGUWVY46DUKLJYX; shshshsID=64a3bd4e7bfdf0ff37089823bf23365d_2_1702117185037; __jda=143920055.2034284339.1700712449.1701161316.1702117163.3; __jdb=143920055.3.2034284339|3.1702117163; __jdc=143920055; shshshfpb=AAp8WF06MEnQF6RHm62qq6XkCbT0dwhaEknCESgAAAAA; rkv=1.0; 3AB9D23F7A4B3C9B=N7DHYIECTBG2Q5I5I7FYMCUVLRQ6JT5BEKEEKW34RH43JFAYFVLF34WLOQWXTUWTX33UXMQM7GN34JSUZICBBTAJNM;"
    user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    url = "https://search.jd.com/Search?"  # url地址
    page_range = 1  # 京东网页总查询页数
    count = 5  # 所需数据个数

    products_json = {"products": []}

    headers = {
        'user-agent': user_agent,
        'Cookie': cookie
    }

    # 获取记录时间
    # current_datetime = datetime.datetime.now()
    # current_datetime_str = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
    item_count = 0  # 计数器

    for page in range(1, page_range * 2 + 1):
        params = {
            'keyword': keyword,
            'page': str(page),
        }
        res = requests.get(url=url, headers=headers, params=params)
        res = parsel.Selector(res.text)
        item = res.xpath('//div[@class="gl-i-wrap"]')
        for txt in item.extract():

            if item_count >= count:  # 检查是否已达到数据要求
                break

            # time.sleep(1)
            analysis = parsel.Selector(txt)
            # 获取商品全名
            matched_texts = analysis.xpath('//div[@class="p-name p-name-type-2"]/a/em/text()').extract()
            name = ''.join(matched_texts).strip()
            if (name == ""):
                matched_texts = analysis.xpath('//div[@class="p-name"]/a/em/text()').extract()
                name = ''.join(matched_texts).strip()
            # 获取商品价格
            price = analysis.xpath('//div[@class="p-price"]/strong/i/text()').extract()[0]

            sid = analysis.xpath('//div[@class="p-commit"]/strong/a/@id').extract()[0][10:]
            # 获取评价数据（好评率）
            # url_commit = "https://club.jd.com/comment/productCommentSummaries.action?"
            # params_commit = {
            #     'referenceIds': sid
            # }
            # commit_request_res = requests.get(url=url_commit, headers=headers, params=params_commit)
            # commit_request_res = commit_request_res.json()
            # comments = commit_request_res.get('CommentsCount')[0]
            # sheet.write(row, 3, comments.get('GoodRate'))

            # 写入商品链接
            url_item = "https://item.jd.com/" + sid + ".html"

            # 查询商品具体信息

            # item_request_res = requests.get(url=url_item, headers=headers)
            # item_request_res = parsel.Selector(item_request_res.text)
            # parameter = item_request_res.xpath('//div[@class="p-parameter"]/ul[@class="parameter2 p-parameter-list"]')
            # data = parameter.xpath('string(.)').extract()[0]
            # data = data.replace(" ", "")[1:-1]
            # datas = data.split('\n')
            # for dat in datas:
            #     dat_list = dat.split("：")
            #     if dat_list[0] == "商品名称":
            #         sheet.write(row, 6, dat_list[1])

            # 写入记录时间
            # sheet.write(row, 5, current_datetime_str)
            product_info = {
                "name": name,
                "price": price,
                "link": url_item
            }
            products_json["products"].append(product_info)
            item_count += 1

    return products_json