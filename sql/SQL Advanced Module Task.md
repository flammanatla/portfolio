# TASK DESCRIPTION

# Collect data which will help to analyse the dynamics of accounts creation, users interaction with emails (received, opened, clicked). These data allows us to compare activity between countries, define key markets, categorise customers per different parameters.

# Final table should contain following columns:

# date | country | send_interval | is_verified | is_unsubscribed |

# account_cnt | sent_msg | open_msg | visit_msg |

# total_country_account_cnt | total_country_sent_cnt | rank_total_country_account_cnt | rank_total_country_sent_cnt

# metrics for accounts and emails should be calculated separately to avoid conflicts for different logic behind field ‘date’. Use UNION to combine results. In the final result leave only those records where rank_total_country_account_cnt <= 10 OR rank_total_country_sent_cnt <= 10.

# Use at least one CTE. Use window functions to calculate ranks.

# [Looker Studio Visualisation with data sourced from query](https://lookerstudio.google.com/reporting/79576511-ac7c-4189-805e-4174c035dc2b)

WITH email_metrics AS (
SELECT
DATE_ADD(s.date, INTERVAL ems.sent_date DAY) AS sent_date,
sp.country,
acc.send_interval,
acc.is_verified,
acc.is_unsubscribed,
COUNT(DISTINCT ems.id_message) AS sent_msg,
COUNT(DISTINCT eo.id_message) AS open_msg,
COUNT(DISTINCT ev.id_message) AS visit_msg,
FROM `DA.email_sent` ems
JOIN `DA.account_session` acs ON ems.id_account = acs.account_id
JOIN `DA.account` acc ON acs.account_id = acc.id
JOIN `DA.session` s ON acs.ga_session_id = s.ga_session_id
JOIN `DA.session_params` sp ON s.ga_session_id = sp.ga_session_id
LEFT JOIN `DA.email_open` eo ON ems.id_message = eo.id_message
LEFT JOIN `DA.email_visit` ev ON ems.id_message = ev.id_message
GROUP BY sent_date, sp.country, acc.send_interval, acc.is_verified, acc.is_unsubscribed
),

accounts AS (
SELECT
s.date,
sp.country,
acc.send_interval,
acc.is_verified,
acc.is_unsubscribed,
COUNT(acc.id) AS account_count
FROM `DA.account` acc
JOIN `DA.account_session` acc_sess ON acc.id = acc_sess.account_id
JOIN `DA.session` s ON acc_sess.ga_session_id = s.ga_session_id
JOIN `DA.session_params` sp ON s.ga_session_id = sp.ga_session_id
GROUP BY s.date, sp.country, acc.send_interval, acc.is_verified, acc.is_unsubscribed
),

# Unite tables via UNION ALL and sum fields

united_data AS (
SELECT
date,
country,
send_interval,
is_verified,
is_unsubscribed,
SUM(account_count) AS account_count,
SUM(sent_msg) AS sent_msg,
SUM(open_msg) AS open_msg,
SUM(visit_msg) AS visit_msg,
FROM (
SELECT
sent_date AS date,
country,
send_interval,
is_verified,
is_unsubscribed,
0 AS account_count,
sent_msg,
open_msg,
visit_msg,
FROM email_metrics

UNION ALL

SELECT
date,
country,
send_interval,
is_verified,
is_unsubscribed,
account_count,
0 AS sent_msg,
0 AS open_msg,
0 AS visit_msg,
FROM accounts
)
GROUP BY date, country, send_interval, is_verified, is_unsubscribed
),

# add window functions to calculate total metrics

total_counts AS (
SELECT
date,
country,
send_interval,
is_verified,
is_unsubscribed,
account_count,
sent_msg,
open_msg,
visit_msg,
SUM(account_count) OVER (PARTITION BY country) AS total_country_account_count,
SUM(sent_msg) OVER (PARTITION BY country) AS total_country_sent_count,
FROM united_data
)

SELECT \*
FROM (
SELECT
date,
country,
send_interval,
is_verified,
is_unsubscribed,
account_count,
sent_msg,
open_msg,
visit_msg,
total_country_account_count,
total_country_sent_count,
DENSE_RANK() OVER(ORDER BY total_country_account_count DESC) AS rank_total_country_account_count,
DENSE_RANK() OVER(ORDER BY total_country_sent_count DESC) AS rank_total_country_sent_count,
FROM total_counts
)
WHERE rank_total_country_account_count <= 10 OR rank_total_country_sent_count <= 10
