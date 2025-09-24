import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー | セキスペくん",
  description: "セキスペくんのプライバシーポリシー。個人情報の取り扱いについて説明します。",
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日: 2025-09-24</p>

      <section className="space-y-4">
        <p>
          本プライバシーポリシーは、セキスペくん（以下「本サービス」）が利用者の個人情報をどのように取り扱うかについて定めるものです。
        </p>

        <h2 className="text-xl font-semibold mt-8">収集する情報</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>入力されたチャット内容および利用ログ</li>
          <li>クッキー等の識別子、ブラウザ・端末情報</li>
          <li>サービスの改善に必要な統計情報</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">利用目的</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>本サービスの提供・維持・改善のため</li>
          <li>不正利用の防止、セキュリティの向上のため</li>
          <li>品質向上のための分析・統計処理のため</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">第三者提供</h2>
        <p>
          法令に基づく場合を除き、ご本人の同意なく個人情報を第三者へ提供することはありません。
        </p>

        <h2 className="text-xl font-semibold mt-8">保管期間</h2>
        <p>利用目的の達成に必要な範囲で適切に保管し、不要となった情報は安全に削除します。</p>

        <h2 className="text-xl font-semibold mt-8">安全管理措置</h2>
        <p>適切な技術的・組織的安全管理措置を講じ、情報の漏えい・滅失・毀損の防止に努めます。</p>

        <h2 className="text-xl font-semibold mt-8">お問い合わせ</h2>
        <p>
          本ポリシーに関するご質問は、運営者までご連絡ください。連絡手段は本サービス上で別途案内します。
        </p>
      </section>
    </main>
  )
}


