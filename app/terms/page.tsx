import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用規約 | セキスペくん",
  description: "セキスペくんの利用規約。サービスのご利用条件を定めます。",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日: 2025-09-24</p>

      <section className="space-y-4">
        <p>
          本利用規約（以下「本規約」）は、セキスペくん（以下「本サービス」）の提供条件および本サービスの利用に関する利用者と運営者との間の権利義務関係を定めるものです。
        </p>

        <h2 className="text-xl font-semibold mt-8">第1条（適用）</h2>
        <p>本規約は、本サービスの提供条件および本サービスの利用に関する一切の関係に適用されます。</p>

        <h2 className="text-xl font-semibold mt-8">第2条（禁止事項）</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>本サービスの運営を妨害するおそれのある行為</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">第3条（免責）</h2>
        <p>
          本サービスは、提供情報の正確性・完全性・有用性等についていかなる保証もしません。利用者は自己の責任において本サービスを利用するものとし、これにより生じた損害について運営者は責任を負いません。
        </p>

        <h2 className="text-xl font-semibold mt-8">第4条（規約の変更）</h2>
        <p>運営者は、本規約の内容を予告なく変更できるものとし、変更後の規約は本サービス上に掲示した時点から効力を生じるものとします。</p>

        <h2 className="text-xl font-semibold mt-8">第5条（準拠法・裁判管轄）</h2>
        <p>本規約は日本法に準拠し、紛争が生じた場合には運営者所在地を管轄する裁判所を第一審の専属的合意管轄とします。</p>
      </section>
    </main>
  )
}


